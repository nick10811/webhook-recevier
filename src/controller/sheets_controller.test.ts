import { describe, test, expect, vi } from 'vitest';
import { BookingObj, SheetsObj } from '../model';
import { SheetsController } from './sheets_controller';
import { GoogleService } from '../service';
import Config from '../config/config';

describe('SheetsController_makeObj', () => {
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

describe('sheetsController_appendReservation', () => {
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

    test.skip('real case', { timeout: 10000}, async () => {
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