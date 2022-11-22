import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

export type CreateNewMintParamsType = {
  connection: Connection;
  payer: Keypair;
  mintAuthority: PublicKey;
  freezeAuthority: PublicKey;
  decimals: number;
};

export async function createNewMint({
  connection,
  payer,
  mintAuthority,
  freezeAuthority,
  decimals,
}: CreateNewMintParamsType): Promise<PublicKey> {
  const mintAddress = await createMint(
    connection,
    payer,
    mintAuthority,
    freezeAuthority,
    decimals
  );

  console.log(`The token mint account address is ${mintAddress}`);
  console.log(
    `See the details on https://explorer.solana.com/address/${mintAddress}?cluster=devnet`
  );

  return mintAddress;
}
