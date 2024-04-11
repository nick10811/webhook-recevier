'use strict';

require('dotenv').config();

const serverless = require('serverless-http');
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

    const lineID = event.source.userId;
    
    const sentMessage = event.message.text;
    var replyMessage = '';

    if (sentMessage === 'book') {
        const uri = `https://cal.com/nick-l-yang-vkljfs/15min?line-id=${lineID}`;
        replyMessage = { type: 'text', text: `This is your booking URL: ${encodeURI(uri)}`};

    } else {
        // create an echoing text message
        replyMessage = { type: 'text', text: `Hello "${lineID}" just said: "${sentMessage}"` };
        console.log(`"${lineID}" just said: "${sentMessage}"`);

        // send a notification after 5s
        setTimeout(() => {
            pushMessage(lineID);
        }, 5000);

    }

    // use reply API
    return client.replyMessage({
        replyToken: event.replyToken,
        messages: [replyMessage],
    });
}

// push notification
function pushMessage(userID) {
    client.pushMessage({
        to: userID,
        messages: [{ type: 'text', text: 'Hello, This is a reminder message.' }],
    });
}

if (process.env.ENVIRONMENT === 'prod') {
    console.log("environment is production");
    module.exports.handler = serverless(app);
} else {
    // listen on port
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`server is listening on ${port}`);
    });
}
