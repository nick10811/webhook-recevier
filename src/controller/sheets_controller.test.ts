import { describe, test, expect, vi } from 'vitest';
import { BookingObj, SheetsObj } from '../model';
import { SheetsController } from './sheets_controller';
import { GoogleService } from '../service';
import Config from '../config';

describe('SheetsController.makeObj', () => {
    test('ok', () => {
        // arrange
        const arg: BookingObj = {
            eventType: 'event-type',
            timestamp: 'timestamp',
            eventTitle: 'event-title',
            bookingId: 'booking-id',
            rescheduleId: 'reschedule-id',
            status: 'status',
            location: 'location',
            videoCallURL: 'video-call-url',
            startTime: 'start-time',
            endTime: 'end-time',
            timezone: 'timezone',
            duration: 'duration',
            attendee: 'attendee',
            email: 'email',
            phone: 'phone',
            lineid: 'lineid',
            greeting: 'greeting',
            rescheduleURI: 'reschedule-uri',
            cancelURI: 'cancel-uri',
        };

        const want: SheetsObj = {
            bookingId: 'booking-id',
            updatedTimestamp: 'timestamp',
            name: 'attendee',
            phone: 'phone',
            lineid: 'lineid',
            duration: 'duration',
            timezone: 'timezone',
            location: 'location',
            eventTitle: 'event-title',
        }
        const controller = new SheetsController(new GoogleService());

        // act
        const got = controller.makeObj(arg);

        // expect
        expect(got).toEqual(want);
    });
});

describe('SheetsController.appendReservation', () => {
    test('ok', async () => {
        // arrange
        const arg = {
            bookingId: 'booking-id',
            timestamp: 'timestamp',
            attendee: 'attendee',
            duration: 'duration',
            timezone: 'timezone',
            location: 'event-location',
            eventTitle: 'event-title',
        } as BookingObj;

        Config.SPREADSHEET_ID = 'spreadsheet-id';
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const appendSheetData = vi.spyOn(mockGoogleService, 'appendSheetData').mockImplementation((spreadsheetId, sheetName, values) => {
            expect(spreadsheetId).equal('spreadsheet-id');
            expect(sheetName).equal('Booking');
            expect(values).toEqual([['booking-id', 'timestamp', '', 'attendee', '', 'duration', 'timezone', 'event-title']]);
            return Promise.resolve({ spreadsheetId: 'sheet-id' });
        });

        // act
        const got = await controller.appendReservation(arg);

        // expect
        expect(appendSheetData).toHaveBeenCalledTimes(1);
        expect(got).toBeUndefined();
    });

    test('GoogleService Error', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const appendSheetData = vi
            .spyOn(mockGoogleService, 'appendSheetData')
            .mockRejectedValue(new Error('whatever'));

        // act
        const got = await controller.appendReservation({} as BookingObj);

        // expect
        expect(appendSheetData).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('failed to append reservation to sheets: whatever');
    });

    test.skip('skip for real case', { timeout: 10000 }, async () => {
        // arrange
        const arg = {
            bookingId: '0000001',
            rescheduleId: undefined,
            status: 'status',
            greeting: 'Hello undefined',
            location: 'event-location',
            duration: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            attendee: 'unknown name',
            rescheduleURI: 'https://example.com/reschedule/uid',
            cancelURI: 'https://example.com/booking/uid?cancel=true&allRemainingBookings=false',
        } as BookingObj;

        Config.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'whatever';
        Config.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = 'whatever';
        const controller = new SheetsController(new GoogleService());

        // act
        const got = await controller.appendReservation(arg);

        // expect
        expect(got).toBeUndefined();
    });
});

describe('SheetsController.findRowIndexOfReservation_Ok', () => {
    type Args = {
        bookingId: string;
        sheetData: string[][];
    };

    type TestCase = {
        name: string,
        args: Args,
        want: number;
    };

    const tests: TestCase[] = [
        {
            name: 'ok: bookingId is found',
            args: {
                bookingId: '002',
                sheetData: [
                    ['001', 'whatever'],
                    ['002', 'whatever'],
                    ['003', 'whatever'],
                ],
            },
            want: 1,
        },
        {
            name: 'ok: bookingId is not found',
            args: {
                bookingId: '004',
                sheetData: [
                    ['001', 'whatever'],
                    ['002', 'whatever'],
                    ['003', 'whatever'],
                ],
            },
            want: -1,
        },
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, async () => {
            // arrange
            const mockGoogleService = new GoogleService();
            const controller = new SheetsController(mockGoogleService);
            Config.SPREADSHEET_ID = 'spreadsheet-id';

            const getSheetData = vi.spyOn(mockGoogleService, 'getSheetData').mockImplementation((spreadsheetId, sheetName) => {
                expect(spreadsheetId).equal('spreadsheet-id');
                expect(sheetName).equal('Booking');
                return Promise.resolve(args.sheetData);
            });

            // act
            const got = await controller.findRowIndexOfReservation(args.bookingId);

            // expect
            expect(getSheetData).toHaveBeenCalledTimes(1);
            expect(got).equal(want);
        });
    });
});

describe('SheetsController.findRowIndexOfReservation_Error', () => {
    test('GoogleService Error', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const getSheetData = vi
            .spyOn(mockGoogleService, 'getSheetData')
            .mockRejectedValue(new Error('whatever'));

        // act
        const got = await controller.findRowIndexOfReservation('whatever');

        // expect
        expect(getSheetData).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('failed to find reservation in sheets: whatever');
    });
});

describe('SheetsController.deleteReservation_Ok', () => {
    test('ok', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);
        Config.SPREADSHEET_ID = 'spreadsheet-id';

        const findRowIndexOfReservation = vi
            .spyOn(controller, 'findRowIndexOfReservation')
            .mockImplementation((bookingId) => {
                expect(bookingId).equal('whatever');
                return Promise.resolve(1);
            });
        const deleteSheetRow = vi
            .spyOn(mockGoogleService, 'deleteSheetRow')
            .mockImplementation((spreadsheetId, sheetId, indexOfRow) => {
                expect(spreadsheetId).equal('spreadsheet-id');
                expect(sheetId).equal(0);
                expect(indexOfRow).equal(1);
                return Promise.resolve({ spreadsheetId: 'whatever' });
            });

        // act
        const got = await controller.deleteReservation('whatever');

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(deleteSheetRow).toHaveBeenCalledTimes(1);
        expect(got).toBeUndefined();
    });
});

describe('SheetsController.deleteReservation_Error', () => {
    test('reservation not found', async () => {
        // arrange
        const controller = new SheetsController(new GoogleService());

        const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(-1);

        // act
        const got = await controller.deleteReservation('whatever');

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('reservation not found');
    });

    test('GoogleService Error', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(1);
        const deleteSheetRow = vi.spyOn(mockGoogleService, 'deleteSheetRow').mockRejectedValue(new Error('whatever'));

        // act
        const got = await controller.deleteReservation('whatever');

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(deleteSheetRow).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('failed to delete reservation in sheets: whatever');
    });
});

describe('SheetsController.updateReservation_Ok', () => {
    test('ok', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const arg = {
            bookingId: 'booking-id',
            rescheduleId: 'reschedule-id',
            timestamp: 'timestamp',
            attendee: 'attendee',
            duration: 'duration',
            timezone: 'timezone',
            location: 'event-location',
            eventTitle: 'event-title',
        } as BookingObj;
        Config.SPREADSHEET_ID = 'spreadsheet-id';

        const findRowIndexOfReservation = vi
            .spyOn(controller, 'findRowIndexOfReservation')
            .mockImplementation((bookingId) => {
                expect(bookingId).equal('reschedule-id');
                return Promise.resolve(0);
            });
        const updateSheetRow = vi
            .spyOn(mockGoogleService, 'updateSheetRow')
            .mockImplementation((spreadsheetId, sheetName, range, values) => {
                expect(spreadsheetId).equal('spreadsheet-id');
                expect(sheetName).equal('Booking');
                expect(range).equal('A1');
                expect(values).toEqual(['booking-id', 'timestamp', '', 'attendee', '', 'duration', 'timezone', 'event-title']);
                return Promise.resolve({ spreadsheetId: 'whatever' });
            });

        // act
        const got = await controller.updateReservation(arg);

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(updateSheetRow).toHaveBeenCalledTimes(1);
        expect(got).toBeUndefined();
    });
});

describe('SheetsController.updateReservation_Error', () => {
    test('undefined reschedule id', async () => {
        // arrange
        const controller = new SheetsController(new GoogleService());

        // act
        const got = await controller.updateReservation({bookingId: 'whatever', rescheduleId: undefined} as BookingObj);

        // expect
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('empty reschedule id');
    });

    test('empty reschedule id', async () => {
        // arrange
        const controller = new SheetsController(new GoogleService());

        // act
        const got = await controller.updateReservation({bookingId: 'whatever', rescheduleId: ''} as BookingObj);

        // expect
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('empty reschedule id');
    });

    test('reservation not found', async () => {
        // arrange
        const controller = new SheetsController(new GoogleService());
        const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(-1);

        // act
        const got = await controller.updateReservation({bookingId: 'whatever', rescheduleId: 'whatever'} as BookingObj);

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('reservation not found');
    });

    test('GoogleService Error', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);
        const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(1);
        const updateSheetRow = vi.spyOn(mockGoogleService, 'updateSheetRow').mockRejectedValue(new Error('whatever'));

        // act
        const got = await controller.updateReservation({bookingId: 'whatever', rescheduleId: 'whatever'} as BookingObj);

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(updateSheetRow).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('failed to update reservation in sheets: whatever');
    });
});