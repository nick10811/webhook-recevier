import { describe, test, expect } from "vitest";
import { LineEventController, ILineEventController, LineEventService } from "./line_event_controller";

interface ILineEventControllerTest extends ILineEventController {
    isTextEvent(event: any): boolean;
}

describe('LineEventController.isTextEvent', () => {
    type Args = {
        event: any;
    };

    type TestCase = {
        name: string,
        args: Args,
        want: boolean;
    };

    const tests: TestCase[] = [
        {
            name: 'false: event.type is undefined',
            args: { event: {} },
            want: false,
        },
        {
            name: 'false: event.message is undefined',
            args: { event: { type: {} } },
            want: false,
        },
        {
            name: 'false: event.type is not message',
            args: { event: { type: 'whatever', message: {} } },
            want: false,
        },
        {
            name: 'false: event.message.type is not text',
            args: { event: { type: 'message', message: { type: 'whatever' } } },
            want: false,
        },
        {
            name: 'true: event is message and message is text',
            args: { event: { type: 'message', message: { type: 'text' } } },
            want: true,
        },
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, () => {
            // arrange
            const ctl = new LineEventController({} as LineEventService) as ILineEventController as ILineEventControllerTest;

            // act
            const got = ctl.isTextEvent(args.event);

            // assert
            expect(got).toBe(want);
        });
    });
});
