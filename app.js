import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const {
  TOKEN,
  JIRA_TOKEN,
  JIRA_URL,
  JIRA_EMAIL,
  JIRA_REPORTER,
  JIRA_PROJECT_KEY,
} = process.env;

const bot = new Telegraf(TOKEN);

try {
  bot.hears(/#task (.*)/, async (ctx) => {
    ctx.reply("Task creating...");
    await axios
      .post(
        JIRA_URL,
        {
          fields: {
            summary: ctx.message.text.replace("#task ", ""),
            project: {
              key: JIRA_PROJECT_KEY,
            },
            issuetype: {
              name: "Task",
            },
            reporter: {
              id: JIRA_REPORTER,
            },
          },
        },
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${JIRA_EMAIL}:${JIRA_TOKEN}`
            ).toString("base64")}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        console.log(res);
        ctx.reply("Task Key: " + res.data.key);
        ctx.reply(
          "Task url: " +
            "https://it-forelad.atlassian.net/browse/" +
            res.data.key
        );
      })
      .catch((err) => {
        ctx.reply("Error: " + err);
      });
  });
} catch (err) {
  bot.on("text", async (ctx) => {
    await ctx.reply("Error: " + err);
  });
}

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
