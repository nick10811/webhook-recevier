require('dotenv').config();

var linebot = require('linebot');

var bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

bot.on('message', function (event) {
    console.log(`print message from user: ${event.message.text}`);

    var replyMsg = `Hello you just said: "${event.message.text}"`;
    event.reply(replyMsg).then(function (data) {
        // success
    }).catch(function (error) {
        // error
    });
});

bot.listen('/linewebhook', 3000, function() {
    console.log('linebot is running on port 3000.');
});