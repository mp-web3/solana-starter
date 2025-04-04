import wallet from "./wallet/Turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import * as dotenv from 'dotenv';
dotenv.config();

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        // Get the image URI from the .env file
        const imageUri = process.env.IMG_URI_WALRUS;

        // Create the metadata object
        const metadata = {
            name: "Gog Sunset Rug",
            symbol: "GSR",
            description: "A beautiful sunset rug NFT from the Gog collection",
            image: imageUri,
            attributes: [
                { trait_type: 'Collection', value: 'Gog' },
                { trait_type: 'Type', value: 'Rug' },
                { trait_type: 'Color', value: 'Sunset' }
            ],
            properties: {
                files: [
                    {
                        type: "image/png",
                        uri: imageUri
                    },
                ]
            },
            creators: [
                {
                    address: process.env.TURBINE_WALLET_ADDRESS,
                    share: 100
                }
            ]
        };

        // Convert metadata to a generic file
        const genericFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata)),
            "metadata.json",
            { contentType: "application/json" }
        );

        // Upload the metadata
        const [myUri] = await umi.uploader.upload([genericFile]);
        console.log("Your metadata URI: ", myUri);
    }
    catch (error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
