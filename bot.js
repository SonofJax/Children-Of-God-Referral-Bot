const bot = new Telegraf(process.env.BOT_TOKEN);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
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
