import * as dotenv from 'dotenv';

dotenv.config();

type Config = NodeJS.ProcessEnv & {
    ENVIRONMENT: 'dev' | 'prod';
    PORT: number;

    // LINE
    CHANNEL_ID: string;
    CHANNEL_SECRET: string;
    CHANNEL_ACCESS_TOKEN: string;

    // GOOGLE
    GOOGLE_SERVICE_ACCOUNT_EMAIL: string;
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: string;
}

export default process.env as Config;