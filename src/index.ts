const serverless = require('serverless-http');
const bodyParser = require('body-parser');
import Config from './config';
import express, { Request, Response } from 'express';
import { middleware, webhook, HTTPFetchError } from '@line/bot-sdk';
import { GoogleService, LineService, lineMiddlewareConfig, lineClientConfig } from './service';
import { BookingController, CalEventController, CalServices, LineEventController, SheetsController } from './controller';
import { CalResponse } from './model';
import i18next from 'i18next';
import Backend from 'i18next-node-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';

// create Express app
const app = express();

// configure i18n
i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        fallbackLng: 'en',
        preload: ['en', 'zh-tw', 'jp'],
        lowerCaseLng: true,
        backend: {
            loadPath: 'locale/{{lng}}.json',
        },
    });
app.use(i18nextMiddleware.handle(i18next));

// line webhook
app.post(
    '/linewebhook',
    middleware(lineMiddlewareConfig),
    async (req: Request, res: Response): Promise<Response> => {
        const lang = req.query.lang as string;
        i18next.changeLanguage(lang);
        console.log(`received a webhook event (line): ${JSON.stringify(req.body)}`)

        const callbackRequest: webhook.CallbackRequest = req.body;
        const events: webhook.Event[] = callbackRequest.events!;

        // Process all the received events asynchronously.
        const results = await Promise.all(
            events.map(async (event: webhook.Event) => {
                try {
                    const lineEventController = new LineEventController({
                        line: new LineService(lineClientConfig),
                    });
                    await lineEventController.handleText(event);
                } catch (err: unknown) {
                    if (err instanceof HTTPFetchError) {
                        console.error('failed to handle line event:')
                        console.error(err.status);
                        console.error(err.headers.get('x-line-request-id'));
                        console.error(err.body);
                    } else if (err instanceof Error) {
                        console.error(`failed to handle line event: ${err.message}`);
                    }

                    return res.status(500).json({ status: 'error' });
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
app.post(
    '/calwebhook',
    async (req: Request, res: Response): Promise<Response> => {
        const lang = req.query.lang as string;
        i18next.changeLanguage(lang);
        console.log(`received a webhook event (cal.com): ${JSON.stringify(req.body)}`)

        const callbackRequest: CalResponse = req.body;
        const calEventController = new CalEventController({
            line: new LineService(lineClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService())
        } as CalServices);

        const result = await calEventController
            .handleEvent(callbackRequest)
            .catch((err) => {
                console.error(`failed to handle cal event: ${err}`);
                return res.status(500).json({ status: 'error' });
            });

        return res.status(200).json({
            status: 'success',
            result,
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
