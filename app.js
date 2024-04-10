require('dotenv').config();

var linebot = require('linebot');

var bot = linebot({
    channelId: process.env.CHANNEL_ID,
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

bot.on('message', function (event) {
    var userID = event.source.userId;
    var replyMsg = `Hello "${userID}" just said: "${event.message.text}"`;
    event.reply(replyMsg).then(function (data) {
        // success
        // push message to user after 5s
        setTimeout(function() {
            pushMessage(userID);
        }, 5000);
    }).catch(function (error) {
        // error
    });
});

bot.listen('/linewebhook', 3000, function() {
    console.log('linebot is running on port 3000.');
});

// push notification
function pushMessage(userID) {
    bot.push(userID, 'Hello, This is a reminder message.');
}