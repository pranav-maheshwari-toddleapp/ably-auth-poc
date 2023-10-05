# Ably auth POC FE

FE sends request to BE for a new token using which it will communicate to Ably channels.

Ably's FE SDK automaticlly refreshes token when the time left for token expiry is 30 sec. It sends a request to BE for a new token.

## Steps to the application

1. `npm install` or `npm i` to install dependencies.
2. `npm start` to run FE on `http://localhost:3000/`.
