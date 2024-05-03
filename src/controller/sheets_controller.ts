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

    async findRowIndexOfReservation(bookingId: string) {
        try {
            const reservations: string[][] = await this._srv.getSheetData(spreadsheetId, sheetName) as string[][];

            // retrieve the row number of the reservation
            let row = -1;
            for (let i = 1; i < reservations.length; i++) {
                if (reservations[i][0] === bookingId) {
                    row = i;
                    break;
                }
            }
            return row;
            
        } catch (e) {
            if (e instanceof Error) {
                console.error(`failed to find reservation in sheets: ${e.message}`);
                return new Error(`failed to find reservation in sheets: ${e.message}`);
            } else {
                console.error(`failed to find reservation in sheets: ${e}`);
                return new Error('failed to find reservation in sheets');
            }
        }
    }
}

export default new SheetsController(new GoogleService());
