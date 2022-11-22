import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { transfer, getMint } from "@solana/spl-token";

export async function transferTokens(
  connection: Connection,
  payer: Keypair,
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: number,
  mint: PublicKey
) {
  const mintInfo = await getMint(connection, mint);
  const txSignature = await transfer(
    connection,
    payer,
    source,
    destination,
    owner,
    amount * 10 ** mintInfo.decimals
  );

  console.log(
    `Transfer Transaction: https://explorer.solana.com/tx/${txSignature}?cluster=devnet`
  );
}
