export * from "./line_event_controller";
export * from "./cal_event_controller";
export * from "./booking_controller";
export * from "./sheets_controller";

import bookingController from "./booking_controller";
import sheetsController from "./sheets_controller";

const controller = {
    booking: bookingController,
    sheets: sheetsController,
};

export default controller;