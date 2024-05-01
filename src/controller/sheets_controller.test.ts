import { describe, test, expect, vi } from "vitest";
import { BookingObj, SheetsObj } from "../model";
import sheetsController from "./sheets_controller";


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

        // act
        const got = sheetsController.makeObj(arg);

        // expect
        expect(got).toEqual(want);
    });
});