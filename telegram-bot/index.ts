// Local polling mode for testing (if you run npm run bot)
import { bot } from "./bot";
import * as dotenv from "dotenv";

dotenv.config();

console.log("Bot starting in polling mode...");
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
