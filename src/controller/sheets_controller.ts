import { BookingObj, SheetsObj } from "../model";
import { GoogleService } from "../service/google_service";

const spreadsheetId = "1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ";
const sheetName = "reservation";

export class SheetsController {
    private _srv: GoogleService;

    constructor(srv: GoogleService) {
        this._srv = srv;
    }

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

    appendReservation(obj: BookingObj) {
        const reservation = this.makeObj(obj);

        try {
            const _ = this._srv
                .appendSheetData(
                    spreadsheetId,
                    sheetName,
                    [[reservation.bookingId, reservation.name, reservation.location, reservation.datetime, reservation.timezone, reservation.status]]);
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message);
                return new Error("failed to append reservation: " + e.message);
            } else {
                console.error(e);
                return new Error("failed to append reservation");
            }
        }
    }
}

export default new SheetsController(new GoogleService());
