import { describe, test, expect, vi } from "vitest";
import { LineEventController, ILineEventController, LineEventService } from "./line_event_controller";
import { LineService } from "../service";
import { messagingApi } from '@line/bot-sdk';

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

describe('LineEventController.handleText_OK', () => {
    type Args = {
        event: any;
        replyMessageTimes: number;
    };

    type TestCase = {
        name: string,
        args: Args,
        want: messagingApi.ReplyMessageResponse | undefined;
    };

    const tests: TestCase[] = [
        {
            name: 'is not text event',
            args: { event: { type: "whatever" }, replyMessageTimes: 0 },
            want: undefined,
        },
        {
            name: 'is text event and message is book',
            args: {
                event: {
                    type: 'message',
                    message: {
                        type: 'text',
                        text: 'book'
                    },
                    source: {
                        userId: 'whatever'
                    }
                },
                replyMessageTimes: 1,
            },
            want: { sentMessages: [{ id: "whatever", quoteToken: "whatever" }] },
        },
        {
            name: 'is text event and message is not book',
            args: {
                event: {
                    type: 'message',
                    message: {
                        type: 'text',
                        text: 'whatever'
                    },
                    source: {
                        userId: 'whatever'
                    }
                },
                replyMessageTimes: 1,
            },
            want: { sentMessages: [{ id: "whatever", quoteToken: "whatever" }] },
        },
    ];

    tests.forEach(({ name, args, want }) => {
        test(name, async () => {
            // arrange
            const srv: LineEventService = { line: new LineService({ channelAccessToken: 'whatever' }) };
            const replyMessage = vi
                .spyOn(srv.line, 'replyMessage')
                .mockResolvedValue({ sentMessages: [{ id: 'whatever', quoteToken: 'whatever' }] });

            const ctl = new LineEventController(srv) as ILineEventController as ILineEventControllerTest;

            // act
            const got = await ctl.handleText(args.event);

            // assert
            expect(replyMessage).toHaveBeenCalledTimes(args.replyMessageTimes);
            expect(got).toStrictEqual(want);
        });
    });
});

describe('LineEventController.handleText_LineError', () => {
    test('replyMessage error', async () => {
        // arrange
        const arg: any = {
            type: 'message',
            message: {
                type: 'text',
                text: 'whatever'
            },
            source: {
                userId: 'whatever'
            }
        };
        const srv: LineEventService = { line: new LineService({ channelAccessToken: 'whatever' }) };
        const replyMessage = vi
            .spyOn(srv.line, 'replyMessage')
            .mockRejectedValue(new Error('whatever'));

        const ctl = new LineEventController(srv) as ILineEventController as ILineEventControllerTest;

        try {
            // act
            await ctl.handleText(arg);
        } catch (e) {
            // expect
            expect(e).toBeInstanceOf(Error);
            expect(e.message).toBe('whatever');
        
        }
    });
});