import moment from "moment-timezone";

function makeDurationString(startTime: string, endTime: string, timezone: string) {
    const start = moment.utc(startTime).tz(timezone).format('YYYY-MM-DD HH:mm');
    const end = moment.utc(endTime).tz(timezone).format('HH:mm');
    return `${start} - ${end}`;
}

function makeObj(payload: Payload): BookingObj {
    const baseURL = payload.bookerUrl;
    const rescheduleURI = baseURL + "/reschedule/" + payload.uid;
    const cancelURI = baseURL + "/booking/" + payload.uid + "?cancel=true&allRemainingBookings=false";

    return {
        greeting: "Hello " + payload.responses.name.value,
        location: payload.location,
        duration: makeDurationString(payload.startTime, payload.endTime, payload.organizer.timeZone),
        timezone: payload.organizer.timeZone,
        attendee: payload.responses.name.value,
        rescheduleURI: rescheduleURI,
        cancelURI: cancelURI,
    };
}

const bookingHandler = {
    makeObj,
};

export default bookingHandler;
