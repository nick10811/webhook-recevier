import moment from "moment-timezone";
import { BookingObj, CalResponse } from "../model";

export interface IBookingController {
    makeObj(resp: CalResponse): BookingObj;
    hasLineID(bookingObj: BookingObj): boolean;
}

export class BookingController implements IBookingController {
    makeObj(resp: CalResponse): BookingObj {
        const payload = resp.payload;
        const baseURL = payload.bookerUrl;
        const rescheduleURI = baseURL + "/reschedule/" + payload.uid;
        const cancelURI = baseURL + "/booking/" + payload.uid + "?cancel=true&allRemainingBookings=false";

        return {
            eventType: resp.triggerEvent,
            timestamp: resp.createdAt,
            eventTitle: payload.eventTitle,
            bookingId: payload.bookingId.toString(),
            rescheduleId: payload.rescheduleId?.toString() ?? undefined,
            status: payload.status,
            
            location: payload.location,
            videoCallURL: payload.metadata?.videoCallUrl ?? undefined,
            startTime: payload.startTime,
            endTime: payload.endTime,
            timezone: payload.organizer.timeZone,
            duration: this.makeDurationString(payload.startTime, payload.endTime, payload.organizer.timeZone),

            attendee: payload.responses.name?.value ?? 'unknown name',
            email: payload.responses.email?.value ?? undefined,
            phone: payload.responses.phone?.value ?? undefined,
            lineid: payload.responses.lineid?.value ?? undefined,

            greeting: 'Hello ' + payload.responses.name?.value,
            rescheduleURI: rescheduleURI,
            cancelURI: cancelURI,
        };
    }

    hasLineID(bookingObj: BookingObj): boolean {
        return bookingObj.lineid !== undefined && bookingObj.lineid !== '';
    }

    private makeDurationString(startTime: string, endTime: string, timezone: string): string {
        const start = moment.utc(startTime, true).tz(timezone).format('YYYY-MM-DD HH:mm');
        const end = moment.utc(endTime, true).tz(timezone).format('HH:mm');
        return `${start} - ${end}`;
    }
}

export default new BookingController();