export * from "./line_event_controller";
export * from "./cal_event_controller";
export * from "./booking_controller";
export * from "./sheets_controller";

import lineEventController from "./line_event_controller";
import bookingController from "./booking_controller";
import sheetsController from "./sheets_controller";

const controller = {
    lineEvent: lineEventController,
    booking: bookingController,
    sheets: sheetsController,
};

export default controller;