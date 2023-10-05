# Ably auth POC

This is a POC for implementing Ably token authentication in a react application.

In this method FE sends request to BE for a new token using which FE will communicate to Ably channels and BE communicates with Ably to fetch new token and then returns that token to FE.

Ably's FE SDK automaticlly refreshes token when the time left for token expiry is 30 sec. It sends a request to BE for a new token.

## Steps to the application

1. `npm install` or `npm i` to install root dependencies.
2. `npm run install-all` to install FE and BE dependencies.
3. `npm run dev` to run FE on `http://localhost:3000/` and BE on `http://localhost:8080/`.
