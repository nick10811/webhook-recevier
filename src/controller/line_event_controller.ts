import { client } from '../client/line_client';
import template from '../template';
import {
    MessageAPIResponseBase,
    webhook,
    Message
} from '@line/bot-sdk';

// push notification
function pushMessage(userID: string) {
    client.pushMessage({
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
    await client.replyMessage({
        replyToken: event.replyToken as string,
        messages: [replyMessage],
    });
};

export default lineEventController;