import { BookingObj, SheetsObj } from "../model";

export class SheetsController {
    makeObj(bookingObj: BookingObj): SheetsObj {
        return {
            bookingId: bookingObj.bookingId,
            name: bookingObj.attendee,
            location: bookingObj.location,
            datetime: bookingObj.duration,
            timezone: bookingObj.timezone,
            status: bookingObj.status,
        };
    }
}

export default new SheetsController();