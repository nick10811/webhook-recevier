import { describe, expect, test, vi } from 'vitest';
import { BookingObj, CalResponse, Payload } from '../model';
import { CalEventController, CalServices, ICalEventController } from './cal_event_controller';
import { BookingController } from './booking_controller';
import { SheetsController } from './sheets_controller';
import { GoogleService, LineService } from '../service';
import { ClientConfig } from '@line/bot-sdk';

interface ICalEventControllerTest extends ICalEventController {
    bookingCreated(payload: Payload);
    bookingCancelled(payload: Payload);
    bookingRescheduled(payload: Payload);
}

describe('CalEventController.bookingCreated_OK', () => {
    test('ok', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const appendReservation = vi
            .spyOn(srv.sheets, 'appendReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        // act
        const got = await ctl.bookingCreated({ responses: { lineid: { value: 'whatever' } } } as Payload);

        // expect
        expect(makeObj).toHaveBeenCalledTimes(1);
        expect(appendReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });
});

describe('CalEventController.bookingCreated_Error', () => {
    test('lineid is null', async () => {
        // arrange
        const srv: CalServices = {
            line: {} as any,
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({} as BookingObj);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCreated({ responses: {} } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('line id is null');
        }
    });

    test('sheets.appendReservation failed', async () => {
        // arrange
        const srv: CalServices = {
            line: {} as any,
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const appendReservation = vi
            .spyOn(srv.sheets, 'appendReservation')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCreated({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(appendReservation).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });

    test('line.pushMessage failed', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const appendReservation = vi
            .spyOn(srv.sheets, 'appendReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCreated({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(appendReservation).toHaveBeenCalledTimes(1);
            expect(pushMessage).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });
});

describe('CalEventController.bookingCancelled_OK', () => {
    test('ok', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever', bookingId: 'book-id' } as BookingObj);
        const deleteReservation = vi
            .spyOn(srv.sheets, 'deleteReservation')
            .mockImplementation((bookingId) => {
                expect(bookingId).toBe('book-id');
                return Promise.resolve(undefined);
            });
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        const payload = { responses: { lineid: { value: 'whatever' } } };

        // act
        const got = await ctl.bookingCancelled(payload as Payload);

        // expect
        expect(makeObj).toHaveBeenCalledTimes(1);
        expect(deleteReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });
});

describe('CalEventController.bookingCancelled_Error', () => {
    test('lineid is null', async () => {
        // arrange
        const srv: CalServices = {
            line: {} as any,
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({} as BookingObj);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCancelled({ responses: {} } as Payload);
        } catch (err) {
            // expect
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('line id is null');
        }
    });

    test('sheets.deleteReservation failed', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever', bookingId: 'book-id' } as BookingObj);
        const deleteReservation = vi
            .spyOn(srv.sheets, 'deleteReservation')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCancelled({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(deleteReservation).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });

    test('line.pushMessage failed', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever', bookingId: 'book-id' } as BookingObj);
        const deleteReservation = vi
            .spyOn(srv.sheets, 'deleteReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCancelled({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(deleteReservation).toHaveBeenCalledTimes(1);
            expect(pushMessage).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });
});

describe('CalEventController.bookingRescheduled_OK', () => {
    test('ok', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const updateReservation = vi
            .spyOn(srv.sheets, 'updateReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        // act
        const got = await ctl.bookingRescheduled({ responses: { lineid: { value: 'whatever' } } } as Payload);

        // expect
        expect(makeObj).toHaveBeenCalledTimes(1);
        expect(updateReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });
});

describe('CalEventController.bookingRescheduled_Error', () => {
    test('lineid is null', async () => {
        // arrange
        const srv: CalServices = {
            line: {} as any,
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({} as BookingObj);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingRescheduled({ responses: {} } as Payload);
        } catch (err) {
            // expect
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('line id is null');
        }
    });

    test('sheets.updateReservation failed', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const updateReservation = vi
            .spyOn(srv.sheets, 'updateReservation')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingRescheduled({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(updateReservation).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });

    test('line.pushMessage failed', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }
        const makeObj = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const updateReservation = vi
            .spyOn(srv.sheets, 'updateReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingRescheduled({ responses: { lineid: { value: 'whatever' } } } as Payload);
        } catch (err) {
            // expect
            expect(makeObj).toHaveBeenCalledTimes(1);
            expect(updateReservation).toHaveBeenCalledTimes(1);
            expect(pushMessage).toHaveBeenCalledTimes(1);
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('whatever');
        }
    });
});

describe('CalEventController.handleEvent_Error', () => {
    test('unknown event type', async () => {
        // arrange
        const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.handleEvent({ triggerEvent: 'whatever', payload: {} } as CalResponse);
        } catch (err) {
            // expect
            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe('received an unknown event: {"triggerEvent":"whatever","payload":{}}');
        }
    });
});

describe('CalEventController.handleEvent_OK', () => {
    test('BOOKING_CREATED', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }

        const bookingCreated = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const appendReservation = vi
            .spyOn(srv.sheets, 'appendReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;
        const body = { triggerEvent: 'BOOKing_CREATED', payload: { responses: { lineid: { value: 'whatever' } } } } as CalResponse;

        // act
        const got = await ctl.handleEvent(body);

        // expect
        expect(bookingCreated).toHaveBeenCalledTimes(1);
        expect(appendReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });

    test('BOOKING_CANCELLED', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }

        const bookingCancelled = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever', bookingId: 'book-id' } as BookingObj);
        const deleteReservation = vi
            .spyOn(srv.sheets, 'deleteReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;
        const body = { triggerEvent: 'BOOKing_CANCELLED', payload: { responses: { lineid: { value: 'whatever' } } } } as CalResponse;

        // act
        const got = await ctl.handleEvent(body);

        // expect
        expect(bookingCancelled).toHaveBeenCalledTimes(1);
        expect(deleteReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });

    test('BOOKING_RESCHEDULED', async () => {
        // arrange
        const srv: CalServices = {
            line: new LineService({} as ClientConfig),
            booking: new BookingController(),
            sheets: new SheetsController(new GoogleService()),
        }

        const bookingRescheduled = vi
            .spyOn(srv.booking, 'makeObj')
            .mockReturnValue({ lineid: 'whatever' } as BookingObj);
        const updateReservation = vi
            .spyOn(srv.sheets, 'updateReservation')
            .mockResolvedValue(undefined);
        const pushMessage = vi
            .spyOn(srv.line, 'pushMessage')
            .mockResolvedValue({} as any);

        const ctl = new CalEventController(srv) as ICalEventController as ICalEventControllerTest;
        const body = { triggerEvent: 'BOOKing_RESCHEDULED', payload: { responses: { lineid: { value: 'whatever' } } } } as CalResponse;

        // act
        const got = await ctl.handleEvent(body);

        // expect
        expect(bookingRescheduled).toHaveBeenCalledTimes(1);
        expect(updateReservation).toHaveBeenCalledTimes(1);
        expect(pushMessage).toHaveBeenCalledTimes(1);
        expect(got).toMatchObject({});
    });
});