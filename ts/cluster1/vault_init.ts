import {
  Connection,
  Keypair,
  SystemProgram,
  PublicKey,
  Commitment,
} from "@solana/web3.js";
import { Program, Wallet, AnchorProvider, Address } from "@coral-xyz/anchor";
import { WbaVault, IDL } from "./programs/wba_vault";
import wallet from "./wallet/Turbin3-wallet.json";
import * as dotenv from 'dotenv';
dotenv.config();
/// J8qKEmQpadFeBuXAVseH8GNrvsyBhMT8MHSVD3enRgJz

// Import our keypair from the wallet file
const turbineWallet = Keypair.fromSecretKey(new Uint8Array(wallet));

// Commitment
const commitment: Commitment = "confirmed";

// Create a devnet connection
const connection = new Connection(`${process.env.RPC_TURBINE}`);

// Create our anchor provider
const provider = new AnchorProvider(connection, new Wallet(turbineWallet), {
  commitment,
});

// Create our program
const program = new Program<WbaVault>(
  IDL,
  `${process.env.WBA_VAULT_PROGRAM_ACCOUNT}` as Address,
  provider,
);

// Create a random keypair
const vaultState = Keypair.generate();
console.log(`Vault public key: ${vaultState.publicKey.toBase58()}`);
console.log("Save this vault state private key:", JSON.stringify(Array.from(vaultState.secretKey)));

// Create the PDA for our enrollment account
// Seeds are "auth", vaultState
const vaultAuth = PublicKey.findProgramAddressSync([Buffer.from("auth"), vaultState.publicKey.toBuffer()], program.programId);

// Create the vault key
// Seeds are "vault", vaultAuth
const vault = PublicKey.findProgramAddressSync([Buffer.from("vault"), vaultAuth[0].toBuffer()], program.programId);

// Execute our enrollment transaction
(async () => {
  try {
    const signature = await program.methods.initialize()
    .accounts({
      owner: turbineWallet.publicKey,
      vaultState: vaultState.publicKey,
      vaultAuth: vaultAuth[0],
      vault: vault[0],
      systemProgram: SystemProgram.programId
    }).signers([turbineWallet, vaultState]).rpc();
    console.log(`Init success! Check out your TX here:\n\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.error(`Oops, something went wrong: ${e}`);
  }
})();
