import Config from '../config';
import { BookingObj, SheetsObj } from '../model';
import { GoogleService } from '../service';

const bookSheetName = 'Booking';

export class SheetsController {
    private _srv: GoogleService;

    constructor(srv: GoogleService) {
        this._srv = srv;
    }

    makeObj(bookingObj: BookingObj): SheetsObj {
        return {
            bookingId: bookingObj.bookingId,
            updatedTimestamp: bookingObj.timestamp,
            name: bookingObj.attendee,
            phone: bookingObj.phone?? '',
            lineid: bookingObj.lineid?? '',
            duration: bookingObj.duration,
            timezone: bookingObj.timezone,
            location: bookingObj.location,
            eventTitle: bookingObj.eventTitle,
        };
    }

    async appendReservation(obj: BookingObj) {
        const reservation = this.makeObj(obj);
        try {
            await this._srv
                .appendSheetData(
                    Config.SPREADSHEET_ID,
                    bookSheetName,
                    [[reservation.bookingId, reservation.updatedTimestamp, reservation.lineid, reservation.name, reservation.phone, reservation.duration, reservation.timezone, reservation.eventTitle]]);
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
            const reservations: string[][] = await this._srv.getSheetData(Config.SPREADSHEET_ID, bookSheetName) as string[][];

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

    async deleteReservation(bookingId: string) {
        const index = await this.findRowIndexOfReservation(bookingId);
        if (index instanceof Error || index < 0) {
            return new Error('reservation not found');
        }

        try {
            await this._srv.deleteSheetRow(Config.SPREADSHEET_ID, Number(Config.SHEET_ID_BOOK), index);
        } catch (e) {
            if (e instanceof Error) {
                console.error(`failed to delete reservation in sheets: ${e.message}`);
                return new Error(`failed to delete reservation in sheets: ${e.message}`);
            } else {
                console.error(`failed to delete reservation in sheets: ${e}`);
                return new Error('failed to delete reservation in sheets');
            }
        }
    }

    async updateReservation(obj: BookingObj) {
        if (!obj.rescheduleId) {
            return new Error('empty reschedule id');
        }

        const index = await this.findRowIndexOfReservation(obj.rescheduleId);
        if (index instanceof Error || index < 0) {
            return new Error('reservation not found');
        }

        const reservation = this.makeObj(obj);
        try {
            await this._srv
                .updateSheetRow(
                    Config.SPREADSHEET_ID,
                    bookSheetName,
                    `A${index+1}`,
                    [reservation.bookingId, reservation.updatedTimestamp, reservation.lineid, reservation.name, reservation.phone, reservation.duration, reservation.timezone, reservation.eventTitle]);
        } catch (e) {
            if (e instanceof Error) {
                console.error(`failed to update reservation in sheets: ${e.message}`);
                return new Error(`failed to update reservation in sheets: ${e.message}`);
            } else {
                console.error(`failed to update reservation in sheets: ${e}`);
                return new Error('failed to update reservation in sheets');
            }
        }

    }
}

export default new SheetsController(new GoogleService());
