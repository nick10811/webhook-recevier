import lineEventController from "./line_event_controller";
import calEventController from "./cal_event_controller";
import bookingController from "./booking_controller";
import sheetsController from "./sheets_controller";

const controller = {
    lineEvent: lineEventController,
    calEvent: calEventController,
    booking: bookingController,
    sheets: sheetsController,
};

export default controller;