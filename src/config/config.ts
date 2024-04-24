export type Config = NodeJS.ProcessEnv & {
    ENVIRONMENT: string;
    CHANNEL_ID: string;
    CHANNEL_SECRET: string;
    CHANNEL_ACCESS_TOKEN: string;
    PORT: string;
}

export default process.env as Config;