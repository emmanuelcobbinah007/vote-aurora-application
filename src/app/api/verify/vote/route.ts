import { NextRequest, NextResponse } from "next/server";
import prisma from "@/libs/prisma";
import { MerkleTreeService } from "@/libs/merkleTreeService";

export async function POST(request: NextRequest) {
  try {
    const { verification_code } = await request.json();

    if (!verification_code) {
      return NextResponse.json(
        { success: false, message: "Verification code required" },
        { status: 400 }
      );
    }

    // Find receipt
    const receipt = await prisma.voteReceipts.findUnique({
      where: { verification_code },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!receipt) {
      return NextResponse.json(
        { success: false, message: "Invalid verification code" },
        { status: 404 }
      );
    }

    // Get Merkle tree (if finalized)
    const merkleTree = await prisma.merkleTree.findUnique({
      where: { election_id: receipt.election_id },
    });

    // Update verified_at timestamp
    await prisma.voteReceipts.update({
      where: { id: receipt.id },
      data: { verified_at: new Date() },
    });

    // Verify the Merkle proof if available
    let proofValid = false;
    if (receipt.merkle_proof && merkleTree) {
      try {
        proofValid = MerkleTreeService.verifyMerkleProof(
          receipt.merkle_proof as any
        );
      } catch (error) {
        console.error("Proof verification failed:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "✅ Vote verified successfully",
      receipt: {
        election_title: receipt.election.title,
        election_status: receipt.election.status,
        voted_at: receipt.issued_at,
        vote_commitment: receipt.vote_commitment,
        merkle_leaf_index: receipt.merkle_leaf_index,
        merkle_proof: receipt.merkle_proof,
        merkle_root: merkleTree?.root_hash,
        tree_finalized: !!merkleTree?.finalized_at,
        finalized_at: merkleTree?.finalized_at,
        proof_valid: proofValid,
        total_votes: merkleTree?.leaf_count,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}
