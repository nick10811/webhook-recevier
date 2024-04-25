import { PushMessageResponse } from '@line/bot-sdk/dist/messaging-api/api';
import { client } from '../client/line_client';
import template from "../template";
import bookingHandler from "./booking_handler";

function bookingCreated(payload: Payload): Promise<PushMessageResponse | undefined>{
    const lineID = getLineID(payload);

    if (!lineID) {
        return Promise.resolve(undefined);
    }
    
    return client.pushMessage({
        to: lineID,
        messages: [template.bookingCreated(bookingHandler.makeObj(payload))],
    });
}

function bookingCancelled(payload: Payload): Promise<PushMessageResponse | undefined>    {
    const lineID = getLineID(payload);

    if (!lineID) {
        return Promise.resolve(undefined);
    }

    return client.pushMessage({
        to: lineID,
        messages: [template.bookingCanceled(bookingHandler.makeObj(payload))],
    });
}

function getLineID(payload: Payload): string | undefined {
    const responses = payload.responses;
    if (!responses.lineid || !responses.lineid.value) {
        console.log('line id is null');
        return;
    }

    const lineID = responses.lineid.value;
    console.log('line id: ' + lineID);
    return lineID;
}

const calEventHandler = async (body: CalResponse): Promise<PushMessageResponse | undefined> => {
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

export default calEventHandler;