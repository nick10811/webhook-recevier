export interface CalResponse {
    triggerEvent: string;
    createdAt: string;
    payload: Payload;
}

export interface Payload {
    bookerUrl: string;
    type: string;
    title: string;
    description: string;
    additionalNotes: string;
    customInputs: CustomInputs | undefined;
    startTime: string;
    endTime: string;
    organizer: Organizer;
    responses: Responses;
    userFieldsResponses: UserFieldsResponses | undefined;
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
    conferenceData: ConferenceData | undefined;
    appsStatus: AppsStatus[];
    eventTitle: string;
    eventDescription: string;
    price: number;
    currency: string;
    length: number;
    bookingId: number;
    metadata: Metadata | undefined;
    status: string;
}

export interface Metadata {
    videoCallUrl: string;
}

export interface AppsStatus {
    appName: string;
    type: string;
    success: number;
    failures: number;
    errors: any[];
    warnings?: any[];
}

export interface ConferenceData {
    createRequest: CreateRequest;
}

export interface CreateRequest {
    requestId: string;
}

export interface DestinationCalendar {
    id: number;
    integration: string;
    externalId: string;
    primaryEmail: string;
    userId: number;
    eventTypeId?: any;
    credentialId: number;
}

export interface Attendee {
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    timeZone: string;
    language: Language;
    utcOffset: number;
}

export interface UserFieldsResponses {
    phone: Phone;
    lineid: Name;
    title: Phone;
}

export interface Responses {
    location: Location | undefined;
    name: Name | undefined;
    email: Name | undefined;
    phone: Phone | undefined;
    title: Phone | undefined;
    notes: Phone | undefined;
    guests: Guests | undefined;
    rescheduleReason: Phone | undefined;
    lineid: Name | undefined;
}

export interface Guests {
    label: string;
    value: any[];
    isHidden: boolean;
}

export interface Phone {
    label: string;
    isHidden: boolean;
}

export interface Name {
    label: string;
    value: string;
    isHidden: boolean;
}

export interface Location {
    label: string;
    value: Value;
    isHidden: boolean;
}

export interface Value {
    optionValue: string;
    value: string;
}

export interface Organizer {
    id: number;
    name: string;
    email: string;
    username: string;
    timeZone: string;
    language: Language | undefined;
    timeFormat: string;
    utcOffset: number;
}

export interface Language {
    locale: string;
}

export interface CustomInputs {
}