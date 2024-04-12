const { client } = require("../client/line_client");
const { bookingCreatedTemplate } = require("../template/booking_created");
const { bookingCanceledTemplate } = require("../template/booking_canceled");

module.exports = function calEventHandler(body) {
    const event = body.triggerEvent;
    const payload = body.payload;
    switch (event) {
        case 'BOOKING_CREATED':
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
        messages: [bookingCreatedTemplate(makeBookingObj(payload))],
    });
}

function bookingCancelled(payload) {
    const lineID = getLineID(payload);

    if (!lineID) {
        return;
    }

    return client.pushMessage({
        to: lineID,
        messages: [bookingCanceledTemplate(makeBookingObj(payload))],
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

function makeBookingObj(payload) {
    const cancelURI = "https://cal.com/booking/" + payload.uid + "?cancel=true&allRemainingBookings=false";

    return {
        greeting: "Hello " + payload.responses.name.value,
        location: payload.location,
        // duration: payload.responses.time.value, // TODO: add duration to the booking object
        timezone: payload.organizer.timeZone,
        attendee: payload.responses.name.value,
        cancelURI: cancelURI,
    };
}