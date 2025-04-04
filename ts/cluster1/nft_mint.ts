import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createSignerFromKeypair, signerIdentity, generateSigner, percentAmount } from "@metaplex-foundation/umi"
import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import * as dotenv from 'dotenv';
dotenv.config();

import wallet from "../Turbin3-wallet.json"
import base58 from "bs58";

// const RPC_ENDPOINT = "https://api.devnet.solana.com";
const RPC_ENDPOINT = "https://turbine-solanad-4cde.devnet.rpcpool.com/168dd64f-ce5e-4e19-a836-f6482ad6b396"
const umi = createUmi(RPC_ENDPOINT);

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const myKeypairSigner = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(myKeypairSigner));
umi.use(mplTokenMetadata());

const mint = generateSigner(umi);

(async () => {
    // Get the metadata URI from the .env file
    const metadataUri = process.env.IMG_METADATA_URI_WALRUS;

    // Check if metadata URI exists
    if (!metadataUri) {
        console.error("Error: Metadata URI not found in .env file. Please run nft_metadata.ts first.");
        return;
    }

    // Create the NFT with the metadata URI
    let tx = await createNft(umi, {
        mint,
        name: "Gog Sunset Rug",
        symbol: "GSR",
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(5) // 5% royalty
    });

    // Send and confirm the transaction
    let result = await tx.sendAndConfirm(umi);
    const signature = base58.encode(result.signature);

    console.log(`Successfully Minted! Check out your TX here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
    console.log("Mint Address: ", mint.publicKey);
})();