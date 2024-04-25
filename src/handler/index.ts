import lineEventHandler from "./line_event_handler";
import calEventHandler from "./cal_event_handler";
import bookingHandler from "./booking_handler";

const handler = {
    lineEvent: lineEventHandler,
    calEvent: calEventHandler,
    booking: bookingHandler,
};

export default handler;