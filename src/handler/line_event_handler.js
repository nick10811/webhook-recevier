const { bookingSystem } = require("../template/booking_system");
import { client } from '../client/line_client';

module.exports = function lineEventHandler(event) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    const lineID = event.source.userId;

    const sentMessage = event.message.text;
    var replyMessage = '';

    if (sentMessage.toLowerCase() === 'book') {
        const uri = `https://cal.com/nick-l-yang-vkljfs/15min?lineid=${lineID}`;
        replyMessage = bookingSystem(uri);

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
