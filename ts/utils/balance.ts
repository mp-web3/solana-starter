import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import * as dotenv from 'dotenv';
import walletRandom from "../Random-wallet.json";
// import wallet from "../Turbin3-wallet.json";

dotenv.config();
// const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));
// const mint = new PublicKey(`${process.env.MINT_ADDRESS}`);
const commitment: Commitment = "confirmed";
const connection = new Connection(`${process.env.ALCHEMY_API_DEVNET}` || "https://api.devnet.solana.com", commitment);
console.log("Using connection:", `${process.env.ALCHEMY_API_DEVNET}` || "https://api.devnet.solana.com");

// Use the mint address from spl_transfer.ts
const mint = new PublicKey(`${process.env.MINT_ADDRESS}`);
// Use the wallet from Random-wallet.json
const randomWallet = Keypair.fromSecretKey(new Uint8Array(walletRandom));

(async () => {
    try {
        // Derive the ATA address
        const ataAddress = await getAssociatedTokenAddress(mint, randomWallet.publicKey);
        console.log("ATA address:", ataAddress.toBase58());

        // Get the balance
        const balance = await getAccount(connection, ataAddress);
        console.log("Balance:", balance.amount.toString());
    } catch (e) {
        console.error("Error:", e);
    }
})();