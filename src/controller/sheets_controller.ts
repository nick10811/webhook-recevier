import { BookingObj, SheetsObj } from '../model';
import { GoogleService } from '../service';

const spreadsheetId = '1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ';
const sheetName = 'reservations';

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

    async appendReservation(obj: BookingObj) {
        const reservation = this.makeObj(obj);
        try {
            await this._srv
                .appendSheetData(
                    spreadsheetId,
                    sheetName,
                    [[reservation.bookingId, reservation.name, reservation.location, reservation.datetime, reservation.timezone, reservation.status]]);
        } catch (e) {
            if (e instanceof Error) {
                console.error(`failed to append reservation to sheets: ${e.message}`);
                return new Error(`failed to append reservation to sheets: ${e.message}`);
            } else {
                console.error(`failed to append reservation to sheets: ${e}`);
                return new Error('failed to append reservation to sheets');
            }
        }
    }
}

export default new SheetsController(new GoogleService());
