import * as dotenv from 'dotenv';

dotenv.config();

type Config = NodeJS.ProcessEnv & {
    ENVIRONMENT: string;
    CHANNEL_ID: string;
    CHANNEL_SECRET: string;
    CHANNEL_ACCESS_TOKEN: string;
    PORT: number;
}

export default process.env as Config;