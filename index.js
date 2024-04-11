'use strict';

require('dotenv').config();

const line = require('@line/bot-sdk');
const express = require('express');

// create LINE SDK config from env variables
const config = {
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/linewebhook', line.middleware(config), (req, res) => {
    console.log(`received a webhook event: ${JSON.stringify(req.body)}`)
    Promise
        .all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

// event handler
function handleEvent(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    // extract user ID
    const userID = event.source.userId;

    // create an echoing text message
    const echo = { type: 'text', text: `Hello "${userID}" just said: "${event.message.text}"` };
    console.log(`"${userID}" just said: "${event.message.text}"`);

    // send a notification after 5s
    // setTimeout(() => {
    //     pushMessage(userID);
    // }, 5000);

    // use reply API
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [echo],
    });
}

// push notification
// function pushMessage(userID) {
//     bot.push(userID, 'Hello, This is a reminder message.');
// }

if (process.env.ENVIRONMENT === 'prod') {
    module.exports.handler = app;
} else {
    // listen on port
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`server is listening on ${port}`);
    });
}
