import * as dotenv from 'dotenv';

dotenv.config();

// the .env file only allows string values
type Config = NodeJS.ProcessEnv & {
    ENVIRONMENT: 'dev' | 'prod';
    PORT: string;

    // LINE
    CHANNEL_ID: string;
    CHANNEL_SECRET: string;
    CHANNEL_ACCESS_TOKEN: string;

    // GOOGLE
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;

    // CAL.COM
    BOOKING_URL: string;

    // GOOGLE SHEETS
    SPREADSHEET_ID: string;
    SHEET_ID_BOOK: string;
    SHEET_ID_CANCEL: string;
}

export default process.env as Config;