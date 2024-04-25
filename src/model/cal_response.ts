interface CalResponse {
    triggerEvent: string;
    createdAt: string;
    payload: Payload;
}
interface Payload {
    bookerUrl: string;
    type: string;
    title: string;
    description: string;
    additionalNotes: string;
    customInputs: CustomInputs;
    startTime: string;
    endTime: string;
    organizer: Organizer;
    responses: Responses;
    userFieldsResponses: UserFieldsResponses;
    attendees: Attendee[];
    location: string;
    conferenceCredentialId: number;
    destinationCalendar: DestinationCalendar[];
    hideCalendarNotes: boolean;
    requiresConfirmation: boolean;
    eventTypeId: number;
    seatsShowAttendees: boolean;
    seatsPerTimeSlot?: any;
    seatsShowAvailabilityCount: boolean;
    schedulingType?: any;
    iCalUID: string;
    iCalSequence: number;
    uid: string;
    conferenceData: ConferenceData;
    appsStatus: AppsStatus[];
    eventTitle: string;
    eventDescription: string;
    price: number;
    currency: string;
    length: number;
    bookingId: number;
    metadata: Metadata;
    status: string;
}
interface Metadata {
    videoCallUrl: string;
}
interface AppsStatus {
    appName: string;
    type: string;
    success: number;
    failures: number;
    errors: any[];
    warnings?: any[];
}
interface ConferenceData {
    createRequest: CreateRequest;
}
interface CreateRequest {
    requestId: string;
}
interface DestinationCalendar {
    id: number;
    integration: string;
    externalId: string;
    primaryEmail: string;
    userId: number;
    eventTypeId?: any;
    credentialId: number;
}
interface Attendee {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    timeZone: string;
    language: Language;
    utcOffset: number;
}
interface UserFieldsResponses {
    phone: Phone;
    lineid: Name;
    title: Phone;
}
interface Responses {
    location: Location;
    name: Name;
    email: Name;
    phone: Phone;
    title: Phone;
    notes: Phone;
    guests: Guests;
    rescheduleReason: Phone;
    lineid: Name;
}
interface Guests {
    label: string;
    value: any[];
    isHidden: boolean;
}
interface Phone {
    label: string;
    isHidden: boolean;
}
interface Name {
    label: string;
    value: string;
    isHidden: boolean;
}
interface Location {
    label: string;
    value: Value;
    isHidden: boolean;
}
interface Value {
    optionValue: string;
    value: string;
}
interface Organizer {
    id: number;
    name: string;
    email: string;
    username: string;
    timeZone: string;
    language: Language;
    timeFormat: string;
    utcOffset: number;
}
interface Language {
    locale: string;
}
interface CustomInputs {
}