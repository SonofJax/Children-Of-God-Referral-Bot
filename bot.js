import { Telegraf } from "telegraf";
import { createClient } from "@supabase/supabase-js";

// ENV Variables (make sure these are set in Render):
const BOT_TOKEN = process.env.BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const bot = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Start command with optional referral
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const referrerId = ctx.startPayload;

  if (referrerId && referrerId !== userId.toString()) {
    // Check if referral already exists
    const { data: existing, error: checkError } = await supabase
      .from("referrals")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!existing) {
      const { error } = await supabase.from("referrals").insert([
        { user_id: userId, referrer_id: referrerId }
      ]);

      if (!error) {
        await ctx.reply("✅ Referral tracked!🙏🏻Welcome my Child🔆");
        await bot.telegram.sendMessage(
          referrerId,
          `🎉 ${ctx.from.first_name} converted using your link!`
        );
      } else {
        await ctx.reply("⚠️ Referral already exists or invalid.");
      }
    } else {
      await ctx.reply("⚠️ Referral already exists or invalid.");
    }
  } else if (referrerId === userId.toString()) {
    await ctx.reply("🤨 You can’t refer yourself.");
  } else {
    await ctx.reply(
      "👋 Welcome to The Children of God!🙏🏻🔆 Get started earning real TON today with our SovereignArcadeBot!\nRead more about our mission to learn about the HeavenOnEarth Mission!"
    );
  }
});

// Referral link command
bot.command("referral", async (ctx) => {
  const username = ctx.botInfo.username;
  const userId = ctx.from.id;
  const referralLink = `https://t.me/${username}?start=${userId}`;
  ctx.reply(`🔗 Your referral link:\n${referralLink}`);
});

// Start polling
bot.launch();
