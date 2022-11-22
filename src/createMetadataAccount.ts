import { Metaplex, toMetaplexFile } from "@metaplex-foundation/js";
import {
  createCreateMetadataAccountV2Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey, Keypair } from "@solana/web3.js";
import * as fs from "fs";
import path from "path";

export type CreateTokenMetadataParamsType = {
  metaplex: Metaplex;
  mint: PublicKey;
  user: Keypair;
  name: string;
  symbol: string;
  description: string;
};

export async function createTokenMetadata({
  metaplex,
  mint,
  user,
  name,
  symbol,
  description,
}: CreateTokenMetadataParamsType) {
  const logoPath = path.join(__dirname, "./assets/logo.png");
  const buffer = fs.readFileSync(logoPath);
  const file = toMetaplexFile(buffer, "logo.png");
  const imgUri = await metaplex.storage().upload(file);
  console.log(`Logo url: ${imgUri}`);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name,
    description,
    image: imgUri,
  });
  console.log("Metadata uri:", uri);

  const metadataPDA = metaplex.nfts().pdas().metadata({ mint });

  const tokenMetadata = {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  } as DataV2;

  const instruction = createCreateMetadataAccountV2Instruction(
    {
      metadata: metadataPDA,
      mint: mint,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV2: {
        data: tokenMetadata,
        isMutable: true,
      },
    }
  );

  return instruction;
}
