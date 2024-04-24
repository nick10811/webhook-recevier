'use strict';

require('dotenv').config();

const serverless = require('serverless-http');
const line = require('@line/bot-sdk');
const express = require('express');
const bodyParser = require('body-parser');
import * as lineConfig from './client/line_client';
import handler from './handler';

// create Express app
const app = express();

// line webhook
app.post('/linewebhook', line.middleware(lineConfig.middlewareConfig), (req, res) => {
    console.log(`received a webhook event (line): ${JSON.stringify(req.body)}`)
    Promise
        .all(req.body.events.map(handler.lineEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

app.use(bodyParser.json());

// cal.com webhook
app.post('/calwebhook', (req, res) => {
    console.log(`received a webhook event (cal.com): ${JSON.stringify(req.body)}`)
    Promise
        .resolve(handler.calEvent(req.body))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
});

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
