'use strict';

require('dotenv').config();

const line = require('@line/bot-sdk');

// create LINE SDK config from env variables
module.exports.config = {
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
module.exports.client = new line.messagingApi.MessagingApiClient({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});