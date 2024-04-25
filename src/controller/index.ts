import lineEventController from "./line_event_controller";
import calEventController from "./cal_event_controller";
import bookingController from "./booking_controller";

const controller = {
    lineEvent: lineEventController,
    calEvent: calEventController,
    booking: bookingController,
};

export default controller;