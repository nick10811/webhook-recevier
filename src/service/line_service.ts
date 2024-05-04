import Config from '../config';
import { ClientConfig, messagingApi, MiddlewareConfig } from '@line/bot-sdk';

// Setup all LINE client and Express configurations.
export const lineClientConfig: ClientConfig = {
    channelAccessToken: Config.CHANNEL_ACCESS_TOKEN || '',
};

export const lineMiddlewareConfig: MiddlewareConfig = {
    channelSecret: Config.CHANNEL_SECRET || '',
};

export class LineService extends messagingApi.MessagingApiClient { }

// Create a new LINE SDK client.
export default new LineService(lineClientConfig);
