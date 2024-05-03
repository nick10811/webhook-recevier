import service, { LineService } from '../service';
import template from '../template';
import { MessageAPIResponseBase, webhook, Message } from '@line/bot-sdk';

// push notification
function pushMessage(userID: string) {
    service.line.pushMessage({
        to: userID,
        messages: [{ type: 'text', text: 'Hello, This is a reminder message.' }],
    });
}

const isTextEvent = (event: any): event is webhook.MessageEvent & { message: webhook.TextMessageContent } => {
    return event.type === 'message' && event.message && event.message.type === 'text';
};

const lineEventController = async (event: webhook.Event): Promise<MessageAPIResponseBase | undefined> => {
    if (!isTextEvent(event)) {
        return;
    }

    const lineID = event.source?.userId;
    const sentMessage = event.message.text;
    var replyMessage: Message;

    if (sentMessage.toLowerCase() === 'book') {
        const uri = `https://cal.com/nick-l-yang-vkljfs/15min?lineid=${lineID}`;
        replyMessage = template.bookingSystem(uri) as Message;

    } else {
        // create an echoing text message
        replyMessage = { type: 'text', text: `Hello "${lineID}" just said: "${sentMessage}"` };
        console.log(`"${lineID}" just said: "${sentMessage}"`);

        // send a notification after 5s
        setTimeout(() => {
            pushMessage(lineID as string);
        }, 5000);

    }

    // use reply API
    await service.line.replyMessage({
        replyToken: event.replyToken as string,
        messages: [replyMessage],
    });
};

export default lineEventController;

export interface LineEventService {
    line: LineService;
}

export interface ILineEventController {
    handleText(event: webhook.Event): Promise<MessageAPIResponseBase | undefined>;
    pushMessage(userID: string): void;
}

export class LineEventController implements ILineEventController {
    private _srv: LineEventService;

    constructor(srv: LineEventService) {
        this._srv = srv
    }

    private isTextEvent = (event: any): event is webhook.MessageEvent & { message: webhook.TextMessageContent } => {
        if (event.type === undefined || event.message === undefined) {
            return false;
        }
        return event.type === 'message' && event.message && event.message.type === 'text';
    };

    async pushMessage(userID: string) {
        this._srv.line.pushMessage({
            to: userID,
            messages: [{ type: 'text', text: 'Hello, This is a reminder message.' }],
        });
    }

    async handleText(event: webhook.Event): Promise<MessageAPIResponseBase | undefined> {
        if (!this.isTextEvent(event)) {
            return Promise.resolve(undefined);
        }

        const lineID = event.source?.userId;
        const sentMessage = event.message.text;
        var replyMessage: Message;

        if (sentMessage.toLowerCase() === 'book') {
            const uri = `https://cal.com/nick-l-yang-vkljfs/15min?lineid=${lineID}`;
            replyMessage = template.bookingSystem(uri) as Message;

        } else {
            // create an echoing text message
            replyMessage = { type: 'text', text: `Hello "${lineID}" just said: "${sentMessage}"` };
            console.log(`"${lineID}" just said: "${sentMessage}"`);

            // send a notification after 5s
            setTimeout(() => {
                this.pushMessage(lineID as string);
            }, 5000);

        }

        // use reply API
        await this._srv.line.replyMessage({
            replyToken: event.replyToken as string,
            messages: [replyMessage],
        });
    }
}