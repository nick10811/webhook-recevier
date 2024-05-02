import { describe, test, expect } from 'vitest';
import { BookingController, IBookingController } from './booking_controller';
import { Payload } from '../model';

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
    test('ok', () => {
        // arrange
        const arg: Payload = {
            bookerUrl: 'https://example.com',
            title: 'event-title',
            startTime: '2024-04-12T13:45:00Z',
            endTime: '2024-04-12T14:00:00Z',
            responses: {
                name: undefined,
                location: undefined,
                email: undefined,
                phone: undefined,
                title: undefined,
                notes: undefined,
                guests: undefined,
                rescheduleReason: undefined,
                lineid: undefined
            },
            location: "event-location",
            uid: 'uid',
            type: '',
            description: '',
            additionalNotes: '',
            customInputs: undefined,
            userFieldsResponses: undefined,
            attendees: [],
            conferenceCredentialId: 0,
            destinationCalendar: [],
            hideCalendarNotes: false,
            requiresConfirmation: false,
            eventTypeId: 0,
            seatsShowAttendees: false,
            seatsShowAvailabilityCount: false,
            iCalUID: '',
            iCalSequence: 0,
            conferenceData: undefined,
            appsStatus: [],
            eventTitle: '',
            eventDescription: '',
            price: 0,
            currency: '',
            length: 0,
            bookingId: 0,
            metadata: undefined,
            status: 'status',
            organizer: {
                id: 0,
                name: '',
                email: '',
                username: '',
                timeZone: 'timezone',
                language: undefined,
                timeFormat: '',
                utcOffset: 0
            }
        };

        const want = {
            bookingId: '0',
            status: 'status',
            greeting: 'Hello undefined',
            location: 'event-location',
            duration: '2024-04-12 13:45 - 14:00',
            timezone: 'timezone',
            attendee: 'unknown name',
            rescheduleURI: 'https://example.com/reschedule/uid',
            cancelURI: 'https://example.com/booking/uid?cancel=true&allRemainingBookings=false',
        }

        // arrange
        const ctl = new BookingController();

        // act
        const got = ctl.makeObj(arg);

        // expect
        expect(got).toEqual(want);
    });
});