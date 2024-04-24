const { client } = require("../client/line_client");
const { bookingCanceledTemplate } = require("../template/booking_canceled");
import bookingCreatedTemplate from "../template/booking_created";
import BookingObj from "../template/booking_obj";

module.exports = function calEventHandler(body) {
    const event = body.triggerEvent;
    const payload = body.payload;
    switch (event.toUpperCase()) {
        case 'BOOKING_CREATED':
        case 'BOOKING_RESCHEDULED':
            return bookingCreated(payload);
        case 'BOOKING_CANCELLED':
            return bookingCancelled(payload);
        default:
            console.log(`received an unknown event: ${JSON.stringify(body)}`);
            return Promise.reject({ status: 400, message: 'unknown event: ' + event });
    }
}

function bookingCreated(payload) {
    const lineID = getLineID(payload);

    if (!lineID) {
        return;
    }
    
    return client.pushMessage({
        to: lineID,
        messages: [bookingCreatedTemplate(BookingObj.makeObj(payload))],
    });
}

function bookingCancelled(payload) {
    const lineID = getLineID(payload);

    if (!lineID) {
        return;
    }

    return client.pushMessage({
        to: lineID,
        messages: [bookingCanceledTemplate(BookingObj.makeObj(payload))],
    });
}

function getLineID(payload) {
    const responses = payload.responses;
    if (!responses.lineid || !responses.lineid.value) {
        console.log('line id is null');
        return;
    }

    const lineID = responses.lineid.value;
    console.log('line id: ' + lineID);
    return lineID;
}
