import { describe, test, expect } from 'vitest';
import { BookingController, IBookingController } from './booking_controller';
import { BookingObj, Payload } from '../model';

interface IBookingControllerTest extends IBookingController {
    // private method
    makeDurationString(startTime: string, endTime: string, timezone: string): string;
}

describe('makeDurationString', () => {
    type Args = {
        startTime: string;
        endTime: string;
        timezone: string;
    };

    type TestCase = {
        name: string,
        args: Args,
        want: string;
    };

    const tests: TestCase[] = [
        {
            name: 'invalid start time',
            args: {
                startTime: 'whatever',
                endTime: '2021-08-01T01:00:00Z',
                timezone: 'Asia/Taipei',
            },
            want: 'Invalid date - 09:00',
        },
        {
            name: "invalid end time",
            args: {
                startTime: '2021-08-01T00:00:00Z',
                endTime: 'whatever',
                timezone: 'Asia/Taipei',
            },
            want: '2021-08-01 08:00 - Invalid date',
        },
        {
            name: "invalid timezone",
            args: {
                startTime: '2021-08-01T00:00:00Z',
                endTime: '2021-08-01T01:00:00Z',
                timezone: 'whatever',
            },
            want: '2021-08-01 00:00 - 01:00',
        },
        {
            name: "America/New_York",
            args: {
                startTime: '2021-08-01T00:00:00Z',
                endTime: '2021-08-01T01:00:00Z',
                timezone: 'America/New_York',
            },
            want: '2021-07-31 20:00 - 21:00',
        }
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, () => {
            // arrange
            const ctl = new BookingController() as IBookingController as IBookingControllerTest;

            // act
            const got = ctl.makeDurationString(args.startTime, args.endTime, args.timezone);

            // expect
            expect(got).toBe(want);
        });
    });

});

describe('makeObj', () => {
    test('ok without reschedule', () => {
        // arrange
        const arg = {
            triggerEvent: 'BOOKING_CREATED',
            createdAt: '2021-08-01T00:00:00Z',
            payload: {
                bookerUrl: 'https://booker.com',
                uid: 'uid',
                eventTitle: 'event-title',
                bookingId: 1,
                status: 'status',
                location: 'location',
                metadata: {
                    videoCallUrl: 'video-call-url',
                },
                startTime: '2021-08-01T00:00:00Z',
                endTime: '2021-08-01T01:00:00Z',
                organizer: {
                    timeZone: 'America/New_York',
                },
                responses: {
                    name: { value: 'name' },
                    email: { value: 'email' },
                    phone: { value: 'phone' },
                    lineid: { value: 'lineid' },
                },
            } as Payload,
        };

        const want = {
            eventType: 'BOOKING_CREATED',
            timestamp: '2021-08-01T00:00:00Z',
            eventTitle: 'event-title',
            bookingId: '1',
            rescheduleId: undefined,
            status: 'status',
            location: 'location',
            videoCallURL: 'video-call-url',
            startTime: '2021-08-01T00:00:00Z',
            endTime: '2021-08-01T01:00:00Z',
            timezone: 'America/New_York',
            duration: '2021-07-31 20:00 - 21:00',
            attendee: 'name',
            email: 'email',
            phone: 'phone',
            lineid: 'lineid',
            greeting: 'Hello name',
            rescheduleURI: 'https://booker.com/reschedule/uid',
            cancelURI: 'https://booker.com/booking/uid?cancel=true&allRemainingBookings=false',
        } as BookingObj;

        // arrange
        const ctl = new BookingController();

        // act
        const got = ctl.makeObj(arg);

        // expect
        expect(got).toMatchObject(want);
    });

    test('ok with reschedule', () => {
        // arrange
        const arg = {
            triggerEvent: 'BOOKING_CREATED',
            createdAt: '2021-08-01T00:00:00Z',
            payload: {
                bookerUrl: 'https://booker.com',
                uid: 'uid',
                eventTitle: 'event-title',
                bookingId: 1,
                rescheduleId: 2,
                status: 'status',
                location: 'location',
                metadata: {
                    videoCallUrl: 'video-call-url',
                },
                startTime: '2021-08-01T00:00:00Z',
                endTime: '2021-08-01T01:00:00Z',
                organizer: {
                    timeZone: 'America/New_York',
                },
                responses: {
                    name: { value: 'name' },
                    email: { value: 'email' },
                    phone: { value: 'phone' },
                    lineid: { value: 'lineid' },
                },
            } as Payload,
        };

        const want = {
            eventType: 'BOOKING_CREATED',
            timestamp: '2021-08-01T00:00:00Z',
            eventTitle: 'event-title',
            bookingId: '1',
            rescheduleId: '2',
            status: 'status',
            location: 'location',
            videoCallURL: 'video-call-url',
            startTime: '2021-08-01T00:00:00Z',
            endTime: '2021-08-01T01:00:00Z',
            timezone: 'America/New_York',
            duration: '2021-07-31 20:00 - 21:00',
            attendee: 'name',
            email: 'email',
            phone: 'phone',
            lineid: 'lineid',
            greeting: 'Hello name',
            rescheduleURI: 'https://booker.com/reschedule/uid',
            cancelURI: 'https://booker.com/booking/uid?cancel=true&allRemainingBookings=false',
        } as BookingObj;

        // arrange
        const ctl = new BookingController();

        // act
        const got = ctl.makeObj(arg);

        // expect
        expect(got).toMatchObject(want);
    });
});

describe('hasLineID', () => {
    type Args = {
        lineid: string | undefined;
    };

    type TestCase = {
        name: string,
        args: Args,
        want: boolean;
    };

    const tests: TestCase[] = [
        {
            name: 'false: undefined',
            args: { lineid: undefined },
            want: false,
        },
        {
            name: 'false: empty string',
            args: { lineid: '' },
            want: false,
        },
        {
            name: 'true: non-empty string',
            args: { lineid: 'whatever' },
            want: true,
        }
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, () => {
            // arrange
            const ctl = new BookingController();
            const obj = { lineid: args.lineid } as BookingObj;

            // act
            const got = ctl.hasLineID(obj);

            // expect
            expect(got).toBe(want);
        });
    });
});