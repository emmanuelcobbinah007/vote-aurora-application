import crypto from "crypto";
import prisma from "./prisma";

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  isLeaf: boolean;
  leafIndex?: number;
}

export interface MerkleProof {
  leaf: string;
  leafIndex: number;
  proof: { hash: string; position: "left" | "right" }[];
  root: string;
}

export class MerkleTreeService {
  /**
   * Hash function for Merkle tree
   */
  private static hash(data: string): string {
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Generate vote commitment (doesn't reveal vote choice)
   */
  static generateVoteCommitment(voteData: any): {
    commitment: string;
    salt: string;
  } {
    const salt = crypto.randomBytes(32).toString("hex");
    const commitment = this.hash(JSON.stringify(voteData) + salt);

    return { commitment, salt };
  }

  /**
   * Generate human-readable verification code
   */
  static generateVerificationCode(): string {
    // Format: ABC-DEF-123-456 (easy to read and type)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars
    let code = "";

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = crypto.randomInt(0, chars.length);
        code += chars[randomIndex];
      }
      if (i < 2) code += "-";
    }

    return code;
  }

  /**
   * Build Merkle tree from vote commitments
   */
  static buildMerkleTree(commitments: string[]): {
    root: string;
    tree: MerkleNode;
    height: number;
  } {
    if (commitments.length === 0) {
      throw new Error("Cannot build tree with no commitments");
    }

    // Create leaf nodes
    const leaves: MerkleNode[] = commitments.map((commitment, index) => ({
      hash: commitment,
      isLeaf: true,
      leafIndex: index,
    }));

    // Build tree bottom-up
    let currentLevel = leaves;
    let height = 0;

    while (currentLevel.length > 1) {
      const nextLevel: MerkleNode[] = [];

      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left; // Duplicate last node if odd

        const parentHash = this.hash(left.hash + right.hash);

        nextLevel.push({
          hash: parentHash,
          left,
          right,
          isLeaf: false,
        });
      }

      currentLevel = nextLevel;
      height++;
    }

    return {
      root: currentLevel[0].hash,
      tree: currentLevel[0],
      height,
    };
  }

  /**
   * Generate Merkle proof for a specific leaf
   */
  static generateMerkleProof(
    tree: MerkleNode,
    leafIndex: number
  ): MerkleProof | null {
    const proof: { hash: string; position: "left" | "right" }[] = [];
    let leafHash = "";

    const findLeaf = (
      node: MerkleNode,
      targetIndex: number,
      currentProof: { hash: string; position: "left" | "right" }[]
    ): boolean => {
      if (node.isLeaf) {
        if (node.leafIndex === targetIndex) {
          leafHash = node.hash;
          return true;
        }
        return false;
      }

      // Try left subtree
      if (node.left && findLeaf(node.left, targetIndex, currentProof)) {
        // Add right sibling to proof
        if (node.right) {
          currentProof.push({ hash: node.right.hash, position: "right" });
        }
        return true;
      }

      // Try right subtree
      if (node.right && findLeaf(node.right, targetIndex, currentProof)) {
        // Add left sibling to proof
        if (node.left) {
          currentProof.push({ hash: node.left.hash, position: "left" });
        }
        return true;
      }

      return false;
    };

    const found = findLeaf(tree, leafIndex, proof);

    if (!found || !leafHash) return null;

    return {
      leaf: leafHash,
      leafIndex,
      proof,
      root: tree.hash,
    };
  }

  /**
   * Verify a Merkle proof
   */
  static verifyMerkleProof(merkleProof: MerkleProof): boolean {
    let computedHash = merkleProof.leaf;

    for (const proofElement of merkleProof.proof) {
      if (proofElement.position === "left") {
        computedHash = this.hash(proofElement.hash + computedHash);
      } else {
        computedHash = this.hash(computedHash + proofElement.hash);
      }
    }

    return computedHash === merkleProof.root;
  }

  /**
   * Finalize Merkle tree for an election (called when election closes)
   */
  static async finalizeElectionMerkleTree(
    electionId: string
  ): Promise<{ success: boolean; root?: string; error?: string }> {
    try {
      // Get all vote receipts for election
      const receipts = await prisma.voteReceipts.findMany({
        where: { election_id: electionId },
        orderBy: { issued_at: "asc" },
      });

      if (receipts.length === 0) {
        console.warn(`No votes to finalize for election ${electionId}`);
        return {
          success: false,
          error: "No votes found for this election",
        };
      }

      // Build Merkle tree
      const commitments = receipts.map((r) => r.vote_commitment);
      const { root, tree, height } = this.buildMerkleTree(commitments);

      // Generate proofs for each receipt
      for (let i = 0; i < receipts.length; i++) {
        const proof = this.generateMerkleProof(tree, i);

        if (proof) {
          await prisma.voteReceipts.update({
            where: { id: receipts[i].id },
            data: {
              merkle_proof: proof as any,
              merkle_leaf_index: i,
            },
          });
        }
      }

      // Store Merkle tree
      await prisma.merkleTree.upsert({
        where: { election_id: electionId },
        create: {
          election_id: electionId,
          root_hash: root,
          tree_height: height,
          leaf_count: receipts.length,
          tree_data: tree as any,
          finalized_at: new Date(),
        },
        update: {
          root_hash: root,
          tree_height: height,
          leaf_count: receipts.length,
          tree_data: tree as any,
          finalized_at: new Date(),
        },
      });

      console.log(`✅ Merkle tree finalized for election ${electionId}`);
      console.log(`Root hash: ${root}`);
      console.log(`Votes: ${receipts.length}`);

      return { success: true, root };
    } catch (error) {
      console.error("Failed to finalize Merkle tree:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get Merkle tree for an election
   */
  static async getElectionMerkleTree(electionId: string) {
    return await prisma.merkleTree.findUnique({
      where: { election_id: electionId },
    });
  }
}
