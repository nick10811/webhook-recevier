# WEBHOOK-RECEIVER

## Description
This is a simple webhook receiver that listens for incoming POST requests and logs the request body to the console.

## Prerequisites
- Node.js (v20 and above)
- npm
- [ngrok](https://ngrok.com/download) (optional)

## Development
- set .env file with the following variables:
  - ENVIRONMENT=dev
  - CHANNEL_ID=line_channel_id
  - CHANNEL_SECRET=line_channel_secret
  - CHANNEL_ACCESS_TOKEN=line_channel_access_token
- run `npm install` to install dependencies
- run `npm build` to build the project
- run `npm start` to start the server

### Archiving
```sh
npm install
npm run build
npm run archive
```

#### ngrok
1. Configure ngrok by running `ngrok authtoken <your_auth_token>`.
2. Run `ngrok http 3000` to expose the server to the internet.
