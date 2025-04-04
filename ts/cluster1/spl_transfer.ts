import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../Turbin3-wallet.json"
import walletRandom from "../Random-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer, getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import * as dotenv from 'dotenv';
dotenv.config();

// We're going to import our turbineWallet from the wallet file
const turbineWallet = Keypair.fromSecretKey(new Uint8Array(wallet));
// We're going to import our randomWallet from the wallet file
const randomWallet = Keypair.fromSecretKey(new Uint8Array(walletRandom));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection('https://api.devnet.solana.com', commitment);

// Mint address
const mint = new PublicKey(`${process.env.MINT_ADDRESS}`);

// Instead of generating a recipient address I am reusing the random wallet
// let kp = Keypair.generate();
// console.log(`Newly generated Public Key: \n${kp.publicKey.toBase58()}`);
// console.log(`Newly generated Secret Key: \n${kp.secretKey}`);

(async () => {
    try {
        // Check if sender has enough SOL
        const senderBalance = await connection.getBalance(turbineWallet.publicKey);
        console.log(`Sender balance: ${senderBalance / LAMPORTS_PER_SOL} SOL`);
        const receiverBalance = await connection.getBalance(randomWallet.publicKey);
        console.log(`Sender balance: ${senderBalance / LAMPORTS_PER_SOL} SOL`);

        if (senderBalance < (LAMPORTS_PER_SOL / 10)) {
            console.log("Sender needs SOL. Requesting airdrop...");
            const airdropSignature = await connection.requestAirdrop(
                turbineWallet.publicKey,
                2 * LAMPORTS_PER_SOL // 2 SOL
            );
            await connection.confirmTransaction({
                signature: airdropSignature,
                blockhash: (await connection.getLatestBlockhash()).blockhash,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
            });
            console.log("Sender funded with 2 SOL");
        }

        if (receiverBalance < (LAMPORTS_PER_SOL / 10)) {
            console.log("Sender needs SOL. Requesting airdrop...");
            const airdropSignature = await connection.requestAirdrop(
                turbineWallet.publicKey,
                LAMPORTS_PER_SOL // 1 SOL
            );
            await connection.confirmTransaction({
                signature: airdropSignature,
                blockhash: (await connection.getLatestBlockhash()).blockhash,
                lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
            });
            console.log("Receiver funded with 1 SOL");
        }

        console.log("1 Getting sender ATA")
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const senderAta = await getOrCreateAssociatedTokenAccount(connection, turbineWallet, mint, turbineWallet.publicKey);
        console.log("Sender ATA:", senderAta.address.toBase58());

        console.log("2 Getting receiver ATA")
        // Get the token account of the toWallet address, and if it does not exist, create it
        const receiverAta = await getOrCreateAssociatedTokenAccount(connection, randomWallet, mint, randomWallet.publicKey);
        console.log("Receiver ATA:", receiverAta.address.toBase58());

        console.log("Transfering Token from sender to receiver")
        // Transfer the new token to the "toTokenAccount" we just created
        const transferTx = await transfer(connection, turbineWallet, senderAta.address, receiverAta.address, turbineWallet, 1_000_000n);
        console.log("Transfer transaction signature:", transferTx);

        // Wait for the transfer to be confirmed
        console.log("Waiting for transfer confirmation...");
        await connection.confirmTransaction({
            signature: transferTx,
            blockhash: (await connection.getLatestBlockhash()).blockhash,
            lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
        });
        console.log("Transfer confirmed!");

        // Check sender's balance
        const senderTokenBalance = await getAccount(connection, senderAta.address);
        console.log(`Sender's token balance after transfer: ${senderTokenBalance.amount}`);

        console.log("Fetching receiver balance.")
        // Get the receiver's token balance
        const receiverAtaBalance = await getAccount(connection, receiverAta.address);
        console.log(`Receiver's token balance: ${receiverAtaBalance.amount}`);

    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();