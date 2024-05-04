import { describe, expect, test, vi } from 'vitest';
import { BookingObj, Payload } from '../model';
import { CalEventController, CalServices, ICalEventController } from './cal_event_controller';
import { BookingController } from './booking_controller';
import { SheetsController } from './sheets_controller';
import { GoogleService, LineService } from '../service';
import { ClientConfig } from '@line/bot-sdk';

interface ICalEventControllerTest extends ICalEventController {
    getLineID(payload: Payload): string | undefined;
    bookingCreated(payload: Payload);
    bookingCancelled(payload: Payload);
    bookingRescheduled(payload: Payload);
}

describe('CalEventController.getLineID_InputError', () => {
    type Args = {
        payload: any;
    };

    type TestCase = {
        name: string,
        args: Args,
        want: string | undefined;
    };

    const tests: TestCase[] = [
        {
            name: 'lineid is null',
            args: { payload: { responses: {} } },
            want: undefined,
        },
        {
            name: 'lineid.value is null',
            args: { payload: { responses: { lineid: {} } } },
            want: undefined,
        }
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, () => {
            // arrange
            const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

            // act
            const got = ctl.getLineID(args.payload as Payload);

            // expect
            expect(got).toBeUndefined();
        });
    });
});

describe('CalEventController.getLineID_OK', () => {
    test('ok', () => {
        // arrange
        const payload = {
            responses: {
                lineid: {
                    value: 'whatever',
                },
            },
        };

        const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

        // act
        const got = ctl.getLineID(payload as Payload);

        // expect
        expect(got).toBe('whatever');
    });
});

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
            .mockReturnValue({} as BookingObj);
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
        const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

        try {
            // act
            await ctl.bookingCreated({ responses: {} } as Payload);
        } catch (err) {
            // expect
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
            .mockReturnValue({} as BookingObj);
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
            .mockReturnValue({} as BookingObj);
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
            .mockReturnValue({ bookingId: 'book-id' } as BookingObj);
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
        const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

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
            .mockReturnValue({ bookingId: 'book-id' } as BookingObj);
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
            .mockReturnValue({ bookingId: 'book-id' } as BookingObj);
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
            .mockReturnValue({} as BookingObj);
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
        const ctl = new CalEventController({} as CalServices) as ICalEventController as ICalEventControllerTest;

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
            .mockReturnValue({} as BookingObj);
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
            .mockReturnValue({} as BookingObj);
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