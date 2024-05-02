import Config from '../config/config';
import {
    ClientConfig,
    messagingApi,
    MiddlewareConfig,
} from '@line/bot-sdk';

// Setup all LINE client and Express configurations.
const clientConfig: ClientConfig = {
    channelAccessToken: Config.CHANNEL_ACCESS_TOKEN || '',
};

export const middlewareConfig: MiddlewareConfig = {
    channelSecret: Config.CHANNEL_SECRET || '',
};

export interface ILineClient extends messagingApi.MessagingApiClient {}

export class LineClient extends messagingApi.MessagingApiClient implements ILineClient {}

// Create a new LINE SDK client.
export const client = new LineClient(clientConfig);
