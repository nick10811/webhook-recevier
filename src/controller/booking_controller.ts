import moment from "moment-timezone";
import { BookingObj, Payload } from "../model";

export interface IBookingController {
    makeObj(payload: Payload): BookingObj;
}

export class BookingController implements IBookingController {
    makeObj(payload: Payload): BookingObj {
        const baseURL = payload.bookerUrl;
        const rescheduleURI = baseURL + "/reschedule/" + payload.uid;
        const cancelURI = baseURL + "/booking/" + payload.uid + "?cancel=true&allRemainingBookings=false";

        return {
            bookingId: payload.bookingId.toString(),
            status: payload.status,
            greeting: "Hello " + payload.responses.name?.value,
            location: payload.location,
            duration: this.makeDurationString(payload.startTime, payload.endTime, payload.organizer.timeZone),
            timezone: payload.organizer.timeZone,
            attendee: payload.responses.name?.value ?? "unknown name",
            rescheduleURI: rescheduleURI,
            cancelURI: cancelURI,
        };
    }

    makeDurationString(startTime: string, endTime: string, timezone: string): string {
        const start = moment.utc(startTime, true).tz(timezone).format('YYYY-MM-DD HH:mm');
        const end = moment.utc(endTime, true).tz(timezone).format('HH:mm');
        return `${start} - ${end}`;
    }
}


function makeDurationString(startTime: string, endTime: string, timezone: string): string {
    const start = moment.utc(startTime, true).tz(timezone).format('YYYY-MM-DD HH:mm');
    const end = moment.utc(endTime, true).tz(timezone).format('HH:mm');
    return `${start} - ${end}`;
}

function makeObj(payload: Payload): BookingObj {
    const baseURL = payload.bookerUrl;
    const rescheduleURI = baseURL + "/reschedule/" + payload.uid;
    const cancelURI = baseURL + "/booking/" + payload.uid + "?cancel=true&allRemainingBookings=false";

    return {
        bookingId: payload.bookingId.toString(),
        status: payload.status,
        greeting: "Hello " + payload.responses.name?.value,
        location: payload.location,
        duration: makeDurationString(payload.startTime, payload.endTime, payload.organizer.timeZone),
        timezone: payload.organizer.timeZone,
        attendee: payload.responses.name?.value ?? "unknown name",
        rescheduleURI: rescheduleURI,
        cancelURI: cancelURI,
    };
}

const bookingController = {
    makeObj,
    makeDurationString,
};

export default bookingController;
