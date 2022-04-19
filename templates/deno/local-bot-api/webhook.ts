import { Bot, webhookCallback } from 'https://deno.land/x/grammy/mod.ts'
import { Application } from "https://deno.land/x/oak/mod.ts";


// 1. Create a bot
export const bot = new Bot(process.env.BOT_TOKEN as string, {
    client: {
        // 2. Set the local Bot API URL
        apiRoot: 'http://bot-api:8081',
    },
})

bot.on('message:text', ctx => ctx.reply(ctx.message.text))

const app = new Application();

app.use(webhookCallback(bot, "oak"));

// 4. Set webhook for handler in Bot API
bot.api.setWebhook('http://bot/webhook')
