import { PushMessageResponse } from '@line/bot-sdk/dist/messaging-api/api';
import template from '../template';
import { BookingController } from './booking_controller';
import { CalResponse, Payload } from '../model';
import { SheetsController } from './sheets_controller';
import { LineService } from '../service';
import { t } from 'i18next';

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
                return this.bookingCreated(payload);
            case 'BOOKING_CANCELLED':
                return this.bookingCancelled(payload);
            case 'BOOKING_RESCHEDULED':
                return this.bookingRescheduled(payload);
            default:
                console.log(`received an unknown event: ${JSON.stringify(body)}`);
                return Promise.reject(new Error(`received an unknown event: ${JSON.stringify(body)}`));
        }
    }

    private async bookingCreated(payload: Payload) {
        const bookingObj = this._srv.booking.makeObj(payload);
        const hasLineID = this._srv.booking.hasLineID(bookingObj);
        if (!hasLineID) {
            console.error('line id is null');
            return Promise.reject(new Error('line id is null'));
        }
        
        const err = await this._srv.sheets.appendReservation(bookingObj);
        if (err instanceof Error) {
            console.error(`failed to append reservation to sheet: ${err.message}`);
            return Promise.reject(new Error(`failed to append reservation to sheet: ${err.message}`));
        }

        return this._srv.line.pushMessage({
            to: bookingObj.lineid as string,
            messages: [template.bookingCreated(bookingObj, t('title.booking_created'))],
        });
    }

    private async bookingRescheduled(payload: Payload) {
        const bookingObj = this._srv.booking.makeObj(payload);
        const hasLineID = this._srv.booking.hasLineID(bookingObj);
        if (!hasLineID) {
            console.error('line id is null');
            return Promise.reject(new Error('line id is null'));
        }

        const err = await this._srv.sheets.updateReservation(bookingObj);
        if (err instanceof Error) {
            console.error(`failed to update reservation to sheet: ${err.message}`);
            return Promise.reject(new Error(`failed to update reservation to sheet: ${err.message}`));
        }

        return this._srv.line.pushMessage({
            to: bookingObj.lineid as string,
            messages: [template.bookingCreated(bookingObj, t('title.booking_rescheduled'))],
        });
    }

    private async bookingCancelled(payload: Payload): Promise<PushMessageResponse | undefined> {
        const bookingObj = this._srv.booking.makeObj(payload);
        const hasLineID = this._srv.booking.hasLineID(bookingObj);
        if (!hasLineID) {
            console.error('line id is null');
            return Promise.reject(new Error('line id is null'));
        }

        const err = await this._srv.sheets.deleteReservation(bookingObj.bookingId);
        if (err instanceof Error) {
            console.error(`failed to delete reservation from sheet: ${err.message}`);
            return Promise.reject(new Error(`failed to delete reservation from sheet: ${err.message}`));
        }

        return this._srv.line.pushMessage({
            to: bookingObj.lineid as string,
            messages: [template.bookingCanceled(bookingObj)],
        });
    }
}