# WEBHOOK-RECEIVER

## Description
This is a simple webhook receiver that listens for incoming POST requests and logs the request body to the console.

## Prerequisites
- Node.js
- npm
- [ngrok](https://ngrok.com/download) (optional)

## Development

### Run

#### ngrok
1. Configure ngrok by running `ngrok authtoken <your_auth_token>`.
2. Run `ngrok http 3000` to expose the server to the internet.
