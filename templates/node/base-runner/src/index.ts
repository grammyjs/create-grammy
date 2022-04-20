import { Bot, Context, session, SessionFlavor } from "grammy";
import { run, sequentialize } from "@grammyjs/runner";

interface SessionData {
  pizzaCount: number;
}

// Flavor the context type to include sessions.
type MyContext = Context & SessionFlavor<SessionData>;


// Create a bot.
const bot = new Bot<MyContext>("<token>");

// Build a unique identifier for the `Context` object.
function getSessionKey(ctx: Context) {
  return ctx.chat?.id.toString();
}

function initial(): SessionData {
  return { pizzaCount: 0 };
}

// Sequentialize before accessing session data!
bot.use(sequentialize(getSessionKey));
bot.use(session({ getSessionKey, initial }));

// Add the usual middleware, now with safe session support.
bot.on("message", (ctx) => ctx.reply("Got your message."));

// Still run it concurrently!
run(bot);