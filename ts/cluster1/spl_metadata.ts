import wallet from "../Turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import * as dotenv from 'dotenv';
dotenv.config();


// Define our Mint address
const mint = publicKey(`${process.env.MINT_ADDRESS}`);
// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const turbineWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, turbineWallet);
umi.use(signerIdentity(createSignerFromKeypair(umi, turbineWallet)));

(async () => {
    try {
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint: mint,
            mintAuthority: signer
        }

        let data: DataV2Args = {
            name: "Pfaffernought",
            symbol: "PFAFF",
            uri: "https://arweave.net/123456",
            sellerFeeBasisPoints: 10,
            creators: null,
            collection: null,
            uses: null
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data: data,
            isMutable: true,
            collectionDetails: null
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi);
        console.log(bs58.encode(result.signature));
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
