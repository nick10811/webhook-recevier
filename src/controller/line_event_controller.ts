import Config, { allowedLineText } from '../config';
import { LineService } from '../service';
import template from '../template';
import { webhook, Message, messagingApi } from '@line/bot-sdk';

export interface LineEventService {
    line: LineService;
}

export interface ILineEventController {
    handleText(event: webhook.Event): Promise<messagingApi.ReplyMessageResponse | undefined>;
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

    async handleText(event: webhook.Event) {
        if (!this.isTextEvent(event)) {
            return Promise.resolve(undefined);
        }

        const lineID = event.source?.userId;
        const sentMessage = event.message.text;
        let replyMessage: Message;

        if (allowedLineText.book.some((text) => text.toLowerCase() === sentMessage.toLowerCase())) {
            // launch booking system
            const uri = `${Config.BOOKING_URL}?lineid=${lineID}`;
            replyMessage = template.bookingSystem(uri) as Message;

        } else {
            // TODO: handle other messages
            return Promise.resolve(undefined);
        }

        // use reply API
        return this._srv.line.replyMessage({
            replyToken: event.replyToken as string,
            messages: [replyMessage],
        });
    }
}