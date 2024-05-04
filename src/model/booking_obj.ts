export interface BookingObj {
    bookingId: string;
    rescheduleId: string | undefined;
    status: string;
    greeting: string;
    location: string;
    duration: string;
    timezone: string;
    attendee: string;
    rescheduleURI: string;
    cancelURI: string;
}