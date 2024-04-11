const { client } = require("../client/line_client");

module.exports = function calEventHandler(body) {
    switch (body.triggerEvent) {
        case 'BOOKING_CREATED':
            bookingCreated(body);
            break;
        case 'BOOKING_CANCELLED':
            bookingCancelled(body);
            break;
        default:
            console.log(`received an unknown event: ${JSON.stringify(req)}`);
    }
}

function bookingCreated(body) {
    const lineID = body.payload.responses.lineid.value;

    client.pushMessage({
        to: lineID,
        messages: [{ type: 'text', text: 'Your booking has been accepted.' }],
    });
}

function bookingCancelled(body) {
    const lineID = body.payload.responses.lineid.value;

    client.pushMessage({
        to: lineID,
        messages: [{ type: 'text', text: 'Your booking has been canceled.' }],
    });
}