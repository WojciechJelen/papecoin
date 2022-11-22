import { createAssociatedTokenAccountInstruction } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export type Params = {
  payer: PublicKey;
  associatedToken: PublicKey;
  owner: PublicKey;
  mint: PublicKey;
  programId: PublicKey;
  associatedTokenProgramId: PublicKey;
};

export const getCreateAssociatedTokenAccountInstruction = ({
  payer,
  associatedToken,
  owner,
  mint,
  programId,
  associatedTokenProgramId,
}: Params) => {
  const createTokenAccountInstruction = createAssociatedTokenAccountInstruction(
    payer,
    associatedToken,
    owner,
    mint,
    programId,
    associatedTokenProgramId
  );

  return createTokenAccountInstruction;
};
