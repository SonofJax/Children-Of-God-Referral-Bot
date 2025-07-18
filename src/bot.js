import express from 'express';                         // 👈 1
express().get('/', (_, res) => res.send('OK'))          // 👈 2
        .listen(process.env.PORT || 9999);              // 👈 3

// …existing imports and bot code below …
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

// rest of your bot logic
const { Telegraf } = require('telegraf');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// ENV Variables (make sure these are set in Render):
// Load env vars (works with either style)
const BOT_TOKEN = process.env.BOT_TOKEN      || process.env.bot_token;
const SUPABASE_URL = process.env.SUPABASE_URL   || process.env.supabaseUrl;
const SUPABASE_KEY = process.env.SUPABASE_KEY   || process.env.supabaseKey;

if (!BOT_TOKEN)      throw new Error('BOT_TOKEN is required.');
if (!SUPABASE_URL)   throw new Error('SUPABASE_URL is required.');
if (!SUPABASE_KEY)   throw new Error('SUPABASE_KEY is required.');

const bot      = new Telegraf(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);


// Start command with optional referral
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  await supabase
  .from("user_stats")
  .upsert(
    {
      user_id: userId,
      username: ctx.from.username || "unknown"
    },
    { onConflict: "user_id" }
  );
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

bot.command("stats", async (ctx) => {
  const userId = ctx.from.id;

  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    ctx.reply("📉 No stats found yet.");
  } else {
    ctx.reply(`📊 Your Stats:
- 👥 Referrals: ${data.referral_count}
- 🖱️ Taps: ${data.tap_count}
- 🎁 Reward Claimed: ${data.reward_claimed ? "Yes" : "No"}`);
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
