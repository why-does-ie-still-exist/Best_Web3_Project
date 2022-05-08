import {
  Connection,
  PublicKey,
  clusterApiUrl,
  Keypair,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import fs from "fs";

export async function getWallet(filename) {
  try {
    await fs.promises.access(filename, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    const wallet = new Keypair();

    const genPublicKey = new PublicKey(wallet._keypair.publicKey);
    const genSecretKey = wallet._keypair.secretKey;
    fs.writeFileSync(
      filename,
      JSON.stringify({
        public: genPublicKey,
        secret: genSecretKey,
        lastbalance: 0,
      }),
      "utf-8"
    );
  }
  const fileContents = JSON.parse(fs.readFileSync(filename, "utf8"));
  const publicKey = new PublicKey(fileContents["public"]);
  const secretKey = Uint8Array.from(Object.values(fileContents["secret"]));
  const readLastBalance = fileContents["lastBalance"];
  const currentBalance = await getWalletBalance(publicKey);

  const computedLastBalance = await getWalletBalance(publicKey);
  fs.writeFileSync(
    filename,
    JSON.stringify({
      public: publicKey,
      secret: secretKey,
      lastBalance: computedLastBalance,
    }),
    "utf-8"
  );

  return {
    public: publicKey,
    secret: secretKey,
    lastbalance: readLastBalance,
    currentbalance: currentBalance,
  };
}

export const getWalletBalance = async (publicKey) => {
  try {
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    const balance = await conn.getBalance(publicKey);
    return balance;
  } catch (err) {
    console.error(err);
  }
};

export const airDropSol = async (publicKey, num_lamports) => {
  try {
    const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
    const fromAirDropSig = await conn.requestAirdrop(publicKey, num_lamports);
    await conn.confirmTransaction(fromAirDropSig);
  } catch (err) {
    console.error(err);
  }
};

export const sendSol = async (
  publicKeyFrom,
  secretKeyFrom,
  publicKeyTo,
  num_lamports,
  message
) => {
  const conn = new Connection(clusterApiUrl("devnet"), "confirmed");
  var transaction;

  if (message) {
    transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(publicKeyFrom),
        toPubkey: new PublicKey(publicKeyTo),
        lamports: num_lamports,
        data: Buffer.from(message),
        programId: new PublicKey(publicKeyTo),
      })
    );
  } else {
    transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(publicKeyFrom),
        toPubkey: new PublicKey(publicKeyTo),
        lamports: num_lamports,
      })
    );
  }

  const signature = await sendAndConfirmTransaction(conn, transaction, [
    Keypair.fromSecretKey(secretKeyFrom),
  ]);
  return signature;
};
