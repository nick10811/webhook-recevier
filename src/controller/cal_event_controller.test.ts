import { describe, expect, test } from 'vitest';
import { Payload } from '../model';
import { CalEventController, CalServices, ICalEventController } from './cal_event_controller';

interface ICalEventControllerTest extends ICalEventController {
    getLineID(payload: Payload): string | undefined;
    bookingCreated(payload: Payload);
}

describe('CalEventController_getLineID_InputError', () => {
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

describe('CalEventController_getLineID_OK', () => {
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
