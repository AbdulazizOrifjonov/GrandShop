const fs = require('fs');
const dotenv = require('dotenv');
const env = dotenv.parse(fs.readFileSync('.env'));
const token = env.TELEGRAM_BOT_TOKEN.replace(/["']/g, '');
fetch('https://api.telegram.org/bot' + token + '/setWebhook?url=https://grand-shop-beryl.vercel.app/api/bot').then(res => res.json()).then(console.log);
