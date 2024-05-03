import { PushMessageResponse } from '@line/bot-sdk/dist/messaging-api/api';
import template from "../template";
import { BookingController } from "./booking_controller";
import { CalResponse, Payload } from '../model';
import { SheetsController } from './sheets_controller';
import { LineService } from '../service/line_service';

export interface CalServices {
    line: LineService;
    booking: BookingController;
    sheets: SheetsController;
}

export interface ICalEventController {
    handleEvent(body: CalResponse): Promise<PushMessageResponse | undefined>;
}

export class CalEventController implements ICalEventController {
    private _srv: CalServices;

    constructor(srv: CalServices) {
        this._srv = srv;
    }

    async handleEvent(body: CalResponse): Promise<PushMessageResponse | undefined> {
        const event = body.triggerEvent;
        const payload = body.payload;
        switch (event.toUpperCase()) {
            case 'BOOKING_CREATED':
            case 'BOOKING_RESCHEDULED':
                return this.bookingCreated(payload);
            case 'BOOKING_CANCELLED':
                return this.bookingCancelled(payload);
            default:
                console.log(`received an unknown event: ${JSON.stringify(body)}`);
                return Promise.reject({ status: 400, message: 'unknown event: ' + event });
        }
    }

    private async bookingCreated(payload: Payload) {
        const lineID = this.getLineID(payload);

        if (!lineID) {
            return Promise.reject(new Error('line id is null'));
        }

        const bookingObj = this._srv.booking.makeObj(payload);
        const err = await this._srv.sheets.appendReservation(bookingObj);
        if (err instanceof Error) {
            console.error(`failed to append reservation to sheet: ${err.message}`);
            return Promise.reject(new Error(`failed to append reservation to sheet: ${err.message}`));
        }

        return this._srv.line.pushMessage({
            to: lineID,
            messages: [template.bookingCreated(bookingObj)],
        });
    }

    private bookingCancelled(payload: Payload): Promise<PushMessageResponse | undefined> {
        const lineID = this.getLineID(payload);

        if (!lineID) {
            return Promise.resolve(undefined);
        }

        const bookingObj = this._srv.booking.makeObj(payload);

        return this._srv.line.pushMessage({
            to: lineID,
            messages: [template.bookingCanceled(bookingObj)],
        });
    }

    private getLineID(payload: Payload): string | undefined {
        const responses = payload.responses;
        if (!responses.lineid || !responses.lineid.value) {
            console.log('line id is null');
            return;
        }

        const lineID = responses.lineid.value;
        console.log('line id: ' + lineID);
        return lineID;
    }
}