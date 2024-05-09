export interface BookingObj {
    eventType: string;
    timestamp: string;
    eventTitle: string;
    bookingId: string;
    rescheduleId: string | undefined;
    status: string;

    location: string;
    videoCallURL: string | undefined;
    startTime: string;
    endTime: string;
    timezone: string;
    duration: string;

    attendee: string;
    email: string | undefined;
    phone: string | undefined;
    lineid: string | undefined;
    
    greeting: string;
    rescheduleURI: string;
    cancelURI: string;
}