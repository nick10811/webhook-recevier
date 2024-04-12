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
    const lineID = getLineID(body);

    if (!lineID) {
        return;
    }
    
    client.pushMessage({
        to: lineID,
        messages: [{ type: 'text', text: 'Your booking has been accepted.' }],
    });
}

function bookingCancelled(body) {
    const lineID = getLineID(body);

    if (!lineID) {
        return;
    }

    client.pushMessage({
        to: lineID,
        messages: [{ type: 'text', text: 'Your booking has been canceled.' }],
    });
}

function getLineID(body) {
    if (!body.payload.responses.lineid || !body.payload.responses.lineid.value) {
        console.log("line id is null");
        return;
    }

    const lineID = body.payload.responses.lineid.value;
    console.log("line id: " + lineID);
    return lineID;
}
