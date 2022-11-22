import { initializeKeypair } from "./initializeKeypair";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { createNewMint } from "./createNewMint";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { createTokenMetadata } from "./createMetadataAccount";
import {
  Account,
  createAssociatedTokenAccount,
  getAccount,
  getAssociatedTokenAddress,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
} from "@solana/spl-token";
import { getCreateAssociatedTokenAccountInstruction } from "./getCreateAssociatedTokenAccountInstruction";
import { mintTokens } from "./mintTokens";
import { transferTokens } from "./transferTokens";

/** Address of the SPL Token program */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

/** Address of the SPL Associated Token Account program */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

const myAddress = new PublicKey("Ea7AAnQJaGb6v3sNWV7cVmtDSvLBpQLryR3DatxSdAin");

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const user = await initializeKeypair(connection);
  console.log("PublicKey:", user.publicKey.toBase58());

  // Setup metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      })
    );

  const transaction = new Transaction();

  // Create a new token mint
  const mint = await createNewMint({
    connection,
    payer: user,
    mintAuthority: user.publicKey,
    freezeAuthority: user.publicKey,
    decimals: 2,
  });

  // Create a metadata account for the token mint
  const createMetadataInstruction = await createTokenMetadata({
    metaplex,
    mint,
    user,
    name: "Papecoin",
    symbol: "PAPAPE",
    description: "Charity",
  });
  // attach metadata instruction tyo the Transaction
  transaction.add(createMetadataInstruction);

  // Create a token account

  // get associated token
  const associatedToken = await getAssociatedTokenAddress(
    mint,
    user.publicKey, // owner
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  let account: Account;
  try {
    account = await getAccount(
      connection,
      associatedToken,
      undefined,
      TOKEN_PROGRAM_ID
    );
  } catch (error) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      try {
        const tokenAcountInstruction =
          getCreateAssociatedTokenAccountInstruction({
            payer: user.publicKey,
            associatedToken,
            //owner: myAddress,
            owner: user.publicKey,
            mint,
            programId: TOKEN_PROGRAM_ID,
            associatedTokenProgramId: ASSOCIATED_TOKEN_PROGRAM_ID,
          });

        transaction.add(tokenAcountInstruction);

        await sendAndConfirmTransaction(
          connection,
          transaction,
          [user],
          undefined
        );
      } catch (error: unknown) {
        // Ignore all errors; for now there is no API-compatible way to selectively ignore the expected
        // instruction error if the associated account exists already.
      }

      // Now this should always succeed
      account = await getAccount(
        connection,
        associatedToken,
        undefined,
        TOKEN_PROGRAM_ID
      );
      console.log(`Token account ${account.address}`);
    } else {
      throw error;
    }
  }

  await mintTokens(connection, user, mint, account.address, user, 100);
}

main()
  .then(() => {
    console.log("Finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
