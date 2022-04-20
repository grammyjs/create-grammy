import { Bot, Context, session } from "https://deno.land/x/grammy/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner/mod.ts";

// Create a bot.
const bot = new Bot("<token>");

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey }));

// Add the usual middleware, now with safe session support.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Still run it concurrently!
run(bot);