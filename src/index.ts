require('dotenv').config();

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
import Config from './config/config';
import express, { Request, Response } from 'express';
import {
    middleware,
    webhook,
    HTTPFetchError,
} from '@line/bot-sdk';
import * as lineConfig from './client/line_client';
import handler from './handler';

// create Express app
const app = express();

// line webhook
app.post(
    '/linewebhook',
    middleware(lineConfig.middlewareConfig),
    async (req: Request, res: Response): Promise<Response> => {
        const callbackRequest: webhook.CallbackRequest = req.body;
        const events: webhook.Event[] = callbackRequest.events!;
        console.log(`received a webhook event (line): ${JSON.stringify(req.body)}`)

        // Process all the received events asynchronously.
        const results = await Promise.all(
            events.map(async (event: webhook.Event) => {
                try {
                    await handler.lineEvent(event);
                } catch (err: unknown) {
                    if (err instanceof HTTPFetchError) {
                        console.error(err.status);
                        console.error(err.headers.get('x-line-request-id'));
                        console.error(err.body);
                    } else if (err instanceof Error) {
                        console.error(err);
                    }

                    // Return an error message.
                    return res.status(500).json({
                        status: 'error',
                    });
                }
            })
        );

        // Return a successful message.
        return res.status(200).json({
            status: 'success',
            results,
        });
    }
);

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

if (Config.ENVIRONMENT === 'prod') {
    console.log("environment is production");
    module.exports.handler = serverless(app);
} else {
    // listen on port
    const port = Config.PORT || 3000;
    app.listen(port, () => {
        console.log(`server is listening on ${port}`);
    });
}
