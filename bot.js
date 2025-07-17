const { Telegraf } = require("telegraf");
const { createClient } = require("@supabase/supabase-js");

// 🔐 Config
const bot = new Telegraf("8005188024:AAGpcn57zegtUZqjnPIq_zbJEOmkVgWCuFA");

const supabase = createClient(
  "https://rmtzqwtqfpebsopoxtqd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdHpxd3RxZnBlYnNvcG94dHFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Mjc5MDcxOCwiZXhwIjoyMDY4MzY2NzE4fQ.MV50jThQS_QvUD5HucSZaPEImF_WYCSDscMVjLOYpew"
);

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(" ");

  if (args.length > 1 && args[1].startsWith("ref_")) {
    const referrerId = parseInt(args[1].replace("ref_", ""));

    if (referrerId !== userId) {
      const { error } = await supabase
        .from("referrals")
        .insert([{ referred_user_id: userId, referrer_user_id: referrerId }]);

      if (!error) {
        await ctx.reply("✅ Referral tracked!🙏🏻Welcome my Child🔆");
        await bot.telegram.sendMessage(referrerId, `🎉 ${ctx.from.first_name} converted using your link!`);
      } else {
        await ctx.reply("⚠️ Referral already exists or invalid.");
      }
    } else {
      ctx.reply("🤨 You can’t refer yourself.");
    }
  } else {
    ctx.reply("👋 Welcome to The Children of God!🙏🏻🔆 Get Started earning real TON today with our SovereignArcadeBot!🙏🏻🔆 Read more about our mission to learn about the HeavenOnEarth Mission!");
  }
});

bot.launch();
