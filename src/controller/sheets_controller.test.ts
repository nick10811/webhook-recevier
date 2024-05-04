import { describe, test, expect, vi } from 'vitest';
import { BookingObj, SheetsObj } from '../model';
import { SheetsController } from './sheets_controller';
import { GoogleService } from '../service';
import Config from '../config';

describe('SheetsController.makeObj', () => {
    test('ok', () => {
        // arrange
        const arg: BookingObj = {
            bookingId: 'bookingId',
            status: 'confirmed',
            greeting: 'Hello undefined',
            location: 'event-location',
            duration: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            attendee: 'unknown name',
            rescheduleURI: 'https://example.com/reschedule/uid',
            cancelURI: 'https://example.com/booking/uid?cancel=true&allRemainingBookings=false',
        };

        const want: SheetsObj = {
            bookingId: 'bookingId',
            name: 'unknown name',
            location: 'event-location',
            datetime: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            status: 'confirmed',
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
        const arg: BookingObj = {
            bookingId: 'bookingId',
            status: 'confirmed',
            greeting: 'Hello undefined',
            location: 'event-location',
            duration: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            attendee: 'whatever name',
            rescheduleURI: 'https://example.com/reschedule/uid',
            cancelURI: 'https://example.com/booking/uid?cancel=true&allRemainingBookings=false',
        };

        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const appendSheetData = vi.spyOn(mockGoogleService, 'appendSheetData').mockImplementation((spreadsheetId, sheetName, values) => {
            expect(spreadsheetId).equal('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
            expect(sheetName).equal('reservations');
            expect(values).toEqual([['bookingId', 'whatever name', 'event-location', '2024-04-12 13:45 - 14:00', 'timezone', 'confirmed']]);
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
        const arg: BookingObj = {
            bookingId: 'whatever',
            status: 'whatever',
            greeting: 'whatever',
            location: 'whatever',
            duration: 'whatever',
            timezone: 'whatever',
            attendee: 'whatever',
            rescheduleURI: 'whatever',
            cancelURI: 'whatever',
        };

        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const appendSheetData = vi
            .spyOn(mockGoogleService, 'appendSheetData')
            .mockImplementation(() => {
                throw new Error('whatever');
            });

        // act
        const got = await controller.appendReservation(arg);

        // expect
        expect(appendSheetData).toHaveBeenCalledTimes(1);
        expect(got).toBeInstanceOf(Error);
        expect((got as Error).message).equal('failed to append reservation to sheets: whatever');
    });

    test.skip('skip for real case', { timeout: 10000 }, async () => {
        // arrange
        const arg: BookingObj = {
            bookingId: '0000001',
            status: 'status',
            greeting: 'Hello undefined',
            location: 'event-location',
            duration: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            attendee: 'unknown name',
            rescheduleURI: 'https://example.com/reschedule/uid',
            cancelURI: 'https://example.com/booking/uid?cancel=true&allRemainingBookings=false',
        };

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

            const getSheetData = vi.spyOn(mockGoogleService, 'getSheetData').mockImplementation((spreadsheetId, sheetName) => {
                expect(spreadsheetId).equal('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
                expect(sheetName).equal('reservations');
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
            .mockImplementation(() => { throw new Error('whatever') });

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

        const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(1);
        const deleteSheetRow = vi.spyOn(mockGoogleService, 'deleteSheetRow').mockImplementation((spreadsheetId, sheetId, indexOfRow) => {
            expect(spreadsheetId).equal('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
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
    type Arg = {
        bookingId: string;
        findRowIndexOfReservation: number | Error;
        deleteReservationTimes: number;
    };
    
    type TestCase = {
        name: string;
        arg: Arg;
        wantErr: string;
    };

    const tests: TestCase[] = [
        {
            name: 'findRowIndexOfReservation Error',
            arg: {
                bookingId: 'whatever',
                findRowIndexOfReservation: new Error('whatever'),
                deleteReservationTimes: 0,
            },
            wantErr: 'reservation not found',
        },
        {
            name: 'reservation not found',
            arg: {
                bookingId: 'whatever',
                findRowIndexOfReservation: -1,
                deleteReservationTimes: 0,
            },
            wantErr: 'reservation not found',
        },
        {
            name: 'GoogleService Error',
            arg: {
                bookingId: 'whatever',
                findRowIndexOfReservation: 1,
                deleteReservationTimes: 1,
            },
            wantErr: 'failed to delete reservation in sheets: whatever',
        },
    ];

    tests.forEach(({ name, arg, wantErr }) => {
        test(name, async () => {
            // arrange
            const mockGoogleService = new GoogleService();
            const controller = new SheetsController(mockGoogleService);

            const findRowIndexOfReservation = vi.spyOn(controller, 'findRowIndexOfReservation').mockResolvedValue(arg.findRowIndexOfReservation);
            const deleteSheetRow = vi.spyOn(mockGoogleService, 'deleteSheetRow').mockImplementation(() => { throw new Error('whatever') });

            // act
            const got = await controller.deleteReservation(arg.bookingId);

            // expect
            expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
            expect(deleteSheetRow).toHaveBeenCalledTimes(arg.deleteReservationTimes);
            expect(got).toBeInstanceOf(Error);
            expect((got as Error).message).equal(wantErr);
        });
    });
});

describe('SheetsController.updateReservation_Ok', () => {
    test('ok', async () => {
        // arrange
        const mockGoogleService = new GoogleService();
        const controller = new SheetsController(mockGoogleService);

        const obj: BookingObj = {
            bookingId: 'booking-id',
            status: 'updated',
            greeting: 'greeting',
            location: 'location',
            duration: 'duration',
            timezone: 'timezone',
            attendee: 'attendee',
            rescheduleURI: 'reschedule-uri',
            cancelURI: 'cancel-uri',
        };

        const findRowIndexOfReservation = vi
            .spyOn(controller, 'findRowIndexOfReservation')
            .mockImplementation((bookingId) => {
                expect(bookingId).equal('booking-id');
                return Promise.resolve(1);
            });
        const updateSheetRow = vi
            .spyOn(mockGoogleService, 'updateSheetRow')
            .mockImplementation((spreadsheetId, sheetName, range, values) => {
                expect(spreadsheetId).equal('1348FLkrFKgTuBClszAG30TLIY2pKtCVeEZm5SzVPURQ');
                expect(sheetName).equal('reservations');
                expect(range).equal('A1');
                expect(values).toEqual(['booking-id', 'attendee', 'location', 'duration', 'timezone', 'updated']);
                return Promise.resolve({ spreadsheetId: 'whatever' });
            });

        // act
        const got = await controller.updateReservation(obj);

        // expect
        expect(findRowIndexOfReservation).toHaveBeenCalledTimes(1);
        expect(updateSheetRow).toHaveBeenCalledTimes(1);
        expect(got).toBeUndefined();
    });
});