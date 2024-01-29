import { ethers } from 'hardhat';
import { expect } from 'chai';
import { MaxUint256, ZeroHash } from 'ethers';
import BalanceTree from '../src/balance-tree';
import { parseBalanceMap } from '../src/parse-balance-map';
import {
  MerkleDistributor,
  MerkleDistributor__factory,
  TestERC20,
  TestERC20__factory,
} from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('MerkleDistributor', () => {
  let token: TestERC20;
  let wallets: HardhatEthersSigner[];
  let wallet0: HardhatEthersSigner;
  let wallet1: HardhatEthersSigner;
  const TIMELOCK_DURATION_DAYS = 0;

  beforeEach('deploy token', async () => {
    wallets = await ethers.getSigners();
    wallet0 = wallets[0];
    wallet1 = wallets[1];
    token = await new TestERC20__factory(wallet0).deploy('Token', 'TKN', 0);
  });

  describe('#token', () => {
    it('returns the token address', async () => {
      const distributor = await new MerkleDistributor__factory(wallet0).deploy(
        token,
        ZeroHash,
        0,
        wallet0,
      );
      expect(await distributor.token()).to.eq(await token.getAddress());
    });
  });

  describe('#merkleRoot', () => {
    it('returns the zero merkle root', async () => {
      const distributor = await new MerkleDistributor__factory(wallet0).deploy(
        token,
        ZeroHash,
        0,
        wallet0,
      );
      expect(await distributor.merkleRoot()).to.eq(ZeroHash);
    });
  });

  describe('#claim', () => {
    it('fails for empty proof', async () => {
      const distributor = await new MerkleDistributor__factory(wallet0).deploy(
        token,
        ZeroHash,
        0,
        wallet0,
      );
      await expect(distributor.claim(0, wallet0, 10, [])).to.be.revertedWith(
        'MerkleDistributor: Invalid proof.',
      );
    });

    it('fails for invalid index', async () => {
      const distributor = await new MerkleDistributor__factory(wallet0).deploy(
        token,
        ZeroHash,
        0,
        wallet0,
      );
      await expect(distributor.claim(0, wallet0, 10, [])).to.be.revertedWith(
        'MerkleDistributor: Invalid proof.',
      );
    });

    describe('two account tree', () => {
      let distributor: MerkleDistributor;
      let tree: BalanceTree;

      beforeEach('deploy', async () => {
        tree = new BalanceTree([
          { account: wallet0.address, amount: 100n },
          { account: wallet1.address, amount: 101n },
        ]);
        distributor = await new MerkleDistributor__factory(wallet0).deploy(
          token,
          tree.getHexRoot(),
          TIMELOCK_DURATION_DAYS,
          wallet0,
        );
        await token.setBalance(distributor, 201);
      });

      it('successful claim', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        await expect(distributor.claim(0, wallet0, 100, proof0))
          .to.emit(distributor, 'Claimed')
          .withArgs(0, wallet0.address, 100);
        const proof1 = tree.getProof(1, wallet1.address, 101n);
        await expect(distributor.connect(wallet1).claim(1, wallet1, 101, proof1))
          .to.emit(distributor, 'Claimed')
          .withArgs(1, wallet1.address, 101);
      });

      it('transfers the token', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        expect(await token.balanceOf(wallet0)).to.eq(0);
        await distributor.claim(0, wallet0, 100, proof0);
        expect(await token.balanceOf(wallet0)).to.eq(100);
      });

      it('must have enough to transfer', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        await token.setBalance(distributor, 99);
        await expect(distributor.claim(0, wallet0, 100, proof0))
          .to.be.revertedWithCustomError(token, 'ERC20InsufficientBalance')
          .withArgs(await distributor.getAddress(), await token.balanceOf(distributor), 100);
      });

      it('sets #isClaimed', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        expect(await distributor.isClaimed(0)).to.eq(false);
        expect(await distributor.isClaimed(1)).to.eq(false);
        await distributor.claim(0, wallet0, 100, proof0);
        expect(await distributor.isClaimed(0)).to.eq(true);
        expect(await distributor.isClaimed(1)).to.eq(false);
      });

      it('cannot allow two claims', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        await distributor.claim(0, wallet0, 100, proof0);
        await expect(distributor.claim(0, wallet0, 100, proof0)).to.be.revertedWith(
          'MerkleDistributor: Drop already claimed.',
        );
      });

      it('cannot claim more than once: 0 and then 1', async () => {
        await distributor.claim(0, wallet0, 100, tree.getProof(0, wallet0.address, 100n));
        await distributor
          .connect(wallet1)
          .claim(1, wallet1, 101, tree.getProof(1, wallet1.address, 101n));

        await expect(
          distributor.claim(0, wallet0, 100, tree.getProof(0, wallet0.address, 100n)),
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
      });

      it('cannot claim more than once: 1 and then 0', async () => {
        await distributor
          .connect(wallet1)
          .claim(1, wallet1, 101, tree.getProof(1, wallet1.address, 101n));
        await distributor.claim(0, wallet0, 100, tree.getProof(0, wallet0.address, 100n));

        await expect(
          distributor.claim(1, wallet1, 101, tree.getProof(1, wallet1.address, 101n)),
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
      });

      it('cannot claim for address other than proof', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        await expect(
          distributor.connect(wallet1).claim(1, wallet1, 101, proof0),
        ).to.be.revertedWith('MerkleDistributor: Invalid proof.');
      });

      it('cannot claim more than proof', async () => {
        const proof0 = tree.getProof(0, wallet0.address, 100n);
        await expect(distributor.claim(0, wallet0, 101, proof0)).to.be.revertedWith(
          'MerkleDistributor: Invalid proof.',
        );
      });

      it('gas', async () => {
        const proof = tree.getProof(0, wallet0.address, 100n);
        const tx = await distributor.claim(0, wallet0, 100, proof);
        const receipt = await tx.wait();
        expect(receipt?.gasUsed).to.lessThanOrEqual(87917);
      });
    });

    describe('larger tree', () => {
      let distributor: MerkleDistributor;
      let tree: BalanceTree;

      beforeEach('deploy', async () => {
        tree = new BalanceTree(
          wallets.map((wallet, ix) => {
            return { account: wallet.address, amount: BigInt(ix + 1) };
          }),
        );
        distributor = await new MerkleDistributor__factory(wallet0).deploy(
          token,
          tree.getHexRoot(),
          TIMELOCK_DURATION_DAYS,
          wallet0,
        );
        await token.setBalance(distributor, 201);
      });

      it('claim index 4', async () => {
        const proof = tree.getProof(4, wallets[4].address, 5n);
        await expect(distributor.connect(wallets[4]).claim(4, wallets[4], 5, proof))
          .to.emit(distributor, 'Claimed')
          .withArgs(4, wallets[4].address, 5);
      });

      it('claim index 9', async () => {
        const proof = tree.getProof(9, wallets[9].address, 10n);
        await expect(distributor.connect(wallets[9]).claim(9, wallets[9], 10, proof))
          .to.emit(distributor, 'Claimed')
          .withArgs(9, wallets[9].address, 10);
      });

      it('gas', async () => {
        const proof = tree.getProof(9, wallets[9].address, 10n);
        const tx = await distributor.connect(wallets[9]).claim(9, wallets[9].address, 10, proof);
        const receipt = await tx.wait();
        expect(receipt?.gasUsed).to.lessThanOrEqual(91227);
      });

      it('gas second down about 15k', async () => {
        await distributor.claim(0, wallets[0], 1, tree.getProof(0, wallets[0].address, 1n));
        const tx = await distributor
          .connect(wallets[1])
          .claim(1, wallets[1], 2, tree.getProof(1, wallets[1].address, 2n));
        const receipt = await tx.wait();
        expect(receipt?.gasUsed).to.lessThanOrEqual(74127);
      });
    });

    describe('realistic size tree', () => {
      let distributor: MerkleDistributor;
      let tree: BalanceTree;

      const NUM_LEAVES = 100_000;
      const NUM_SAMPLES = 25;

      before(() => {
        const elements: { account: string; amount: bigint }[] = [];
        for (let i = 0; i < NUM_LEAVES; i++) {
          const node = { account: wallet0.address, amount: 100n };
          elements.push(node);
        }
        tree = new BalanceTree(elements);
      });

      beforeEach(async () => {
        distributor = await new MerkleDistributor__factory(wallet0).deploy(
          token,
          tree.getHexRoot(),
          TIMELOCK_DURATION_DAYS,
          wallet0,
        );
        await token.setBalance(distributor, MaxUint256);
      });

      it('proof verification works', () => {
        const root = Buffer.from(tree.getHexRoot().slice(2), 'hex');
        for (let i = 0; i < NUM_LEAVES; i += NUM_LEAVES / NUM_SAMPLES) {
          const proof = tree
            .getProof(i, wallet0.address, 100n)
            .map(el => Buffer.from(el.slice(2), 'hex'));
          const validProof = BalanceTree.verifyProof(i, wallet0.address, 100n, proof, root);
          expect(validProof).to.be.true;
        }
      });

      it('gas', async () => {
        const proof = tree.getProof(50000, wallet0.address, 100n);
        const tx = await distributor.claim(50000, wallet0, 100, proof);
        const receipt = await tx.wait();
        expect(receipt?.gasUsed).to.lessThanOrEqual(101112);
      });

      it('gas deeper node', async () => {
        const proof = tree.getProof(90000, wallet0.address, 100n);
        const tx = await distributor.claim(90000, wallet0, 100, proof);
        const receipt = await tx.wait();
        expect(receipt?.gasUsed).to.lessThanOrEqual(101084);
      });

      it('gas average random distribution', async () => {
        let total: bigint = 0n;
        let count: number = 0;
        for (let i = 0; i < NUM_LEAVES; i += NUM_LEAVES / NUM_SAMPLES) {
          const proof = tree.getProof(i, wallet0.address, 100n);
          const tx = await distributor.claim(i, wallet0, 100, proof);
          const receipt = await tx.wait();
          total = total + (receipt?.gasUsed as bigint);
          count++;
        }
        const average = total / BigInt(count);
        expect(average).to.lessThanOrEqual(84496);
      });

      // this is what we gas golfed by packing the bitmap
      it('gas average first 25', async () => {
        let total: bigint = 0n;
        let count: number = 0;
        for (let i = 0; i < 25; i++) {
          const proof = tree.getProof(i, wallet0.address, 100n);
          const tx = await distributor.claim(i, wallet0, 100, proof);
          const receipt = await tx.wait();
          total = total + (receipt?.gasUsed as bigint);
          count++;
        }
        const average = total / BigInt(count);
        expect(average).to.lessThanOrEqual(68228);
      });

      it('no double claims in random distribution', async () => {
        for (let i = 0; i < 25; i += Math.floor(Math.random() * (NUM_LEAVES / NUM_SAMPLES))) {
          const proof = tree.getProof(i, wallet0.address, 100n);
          await distributor.claim(i, wallet0, 100, proof);
          await expect(distributor.claim(i, wallet0, 100, proof)).to.be.revertedWith(
            'MerkleDistributor: Drop already claimed.',
          );
        }
      });
    });
  });

  describe('parseBalanceMap', () => {
    let distributor: MerkleDistributor;
    let claims: {
      [account: string]: {
        index: number;
        amount: string;
        proof: string[];
      };
    };

    beforeEach('deploy', async () => {
      const {
        claims: innerClaims,
        merkleRoot,
        tokenTotal,
      } = parseBalanceMap({
        [wallet0.address]: '200',
        [wallet1.address]: '300',
        [wallets[2].address]: '250',
      });
      expect(tokenTotal).to.eq('0x2ee'); // 750
      claims = innerClaims;
      distributor = await new MerkleDistributor__factory(wallet0).deploy(
        token,
        merkleRoot,
        TIMELOCK_DURATION_DAYS,
        wallet0,
      );
      await token.setBalance(distributor, tokenTotal);
    });

    it('check the proofs is as expected', () => {
      const [addr0, addr1, addr2] = [wallet0.address, wallet1.address, wallets[2].address].sort();
      expect(claims).to.deep.eq({
        [addr0]: {
          index: 0,
          amount: '0xfa',
          proof: ['0x0c9bcaca2a1013557ef7f348b514ab8a8cd6c7051b69e46b1681a2aff22f4a88'],
        },
        [addr1]: {
          index: 1,
          amount: '0x12c',
          proof: [
            '0xc86fd316fa3e7b83c2665b5ccb63771e78abcc0429e0105c91dde37cb9b857a4',
            '0xf3c5acb53398e1d11dcaa74e37acc33d228f5da944fbdea9a918684074a21cdb',
          ],
        },
        [addr2]: {
          index: 2,
          amount: '0xc8',
          proof: [
            '0x0782528e118c4350a2465fbeabec5e72fff06991a29f21c08d37a0d275e38ddd',
            '0xf3c5acb53398e1d11dcaa74e37acc33d228f5da944fbdea9a918684074a21cdb',
          ],
        },
      });
    });

    it('all claims work exactly once', async () => {
      for (let account of [wallet0, wallet1, wallets[2]]) {
        const claim = claims[account.address];
        await expect(
          distributor.connect(account).claim(claim.index, account, claim.amount, claim.proof),
        )
          .to.emit(distributor, 'Claimed')
          .withArgs(claim.index, account, claim.amount);
        await expect(
          distributor.connect(account).claim(claim.index, account, claim.amount, claim.proof),
        ).to.be.revertedWith('MerkleDistributor: Drop already claimed.');
      }
      expect(await token.balanceOf(distributor)).to.eq(0);
    });
  });
});
