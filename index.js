import { getWallet, airDropSol, sendSol } from "./web3_module.mjs";

import { LAMPORTS_PER_SOL } from "@solana/web3.js";

import { program } from "commander";

import { stripIndent } from "common-tags";

program
  .name("Simple Solana Devnet CLI")
  .description("CLI for testing Solana web3 js capabilities")
  .version("69");

program
  .command("interact")
  .description(
    "Look at characteristics of existing wallet or create a new wallet"
  )
  .argument("<filename>", "path to wallet file")
  .action(async (filename) => {
    const wallet_info = await getWallet(filename);
    console.log(
      stripIndent`
      Public Address: ${wallet_info["public"]}
      When we last saw this wallet, it had a balance of: ${wallet_info["lastbalance"]}
      It now has a balance of: ${wallet_info["currentbalance"]}`
    );
  });

program
  .command("airdrop")
  .description("Get airdropped Solana for testing")
  .argument("<filename>", "path to wallet file")
  .option("-s <num_solana>", "Number of Solana to ask for", NaN)
  .option("-l <num_lamports>", "Number of Lamports to ask for", NaN)
  .action(async (filename, options) => {
    const wallet_info = await getWallet(filename);
    if (options["s"] && options["l"]) {
      console.log("Cannot use both # of Solana and Lamports");
    } else {
      if (options["l"]) {
        airDropSol(wallet_info["public"], options["l"]);
      } else {
        airDropSol(wallet_info["public"], options["s"] * LAMPORTS_PER_SOL);
      }
    }
    console.log("Airdrop successful.");
  });

program
  .command("send")
  .description("Send solana between two wallets")
  .argument("<filename>", "path to wallet file")
  .argument("<dest_addr>", "destination address")
  .option("-s <num_solana>", "Number of Solana to send", NaN)
  .option("-l <num_lamports>", "Number of Lamports to send", NaN)
  .option("-m <message>", "message to attach to transaction", "")
  .action(async (filename, dest_addr, options) => {
    const wallet_info = await getWallet(filename);
    if (options["s"] && options["l"]) {
      console.log("Cannot use both # of Solana and Lamports");
    } else {
      if (options["l"]) {
        sendSol(
          wallet_info["public"],
          wallet_info["secret"],
          dest_addr,
          options["l"],
          options["m"]
        );
      } else {
        sendSol(
          wallet_info["public"],
          wallet_info["secret"],
          dest_addr,
          options["s"] * LAMPORTS_PER_SOL,
          options["m"]
        );
      }
    }
    console.log("Transaction successful.");
  });

program.parse();
