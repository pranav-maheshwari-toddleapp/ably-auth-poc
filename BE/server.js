const Ably = require("ably");
const cors = require("cors");
const express = require("express");
const app = express();

const rest = new Ably.Rest({ key: "COLp9w.0CNo-Q:9wvmiPdAFHlTQKSO" });

app.use(cors());

let count = 1;

// Issue token requests to clients sending a request to the /auth endpoint
app.get("/auth", async (req, res) => {
  console.log(`API called ${count++}`, new Date().toLocaleString());
  if (!req?.query?.clientId) {
    res.status(500).send("Client ID not found!!!!");
  }

  const tokenParams = {
    capability: { "*": ["publish", "subscribe"] },
    clientId: req.query.clientId,
    ttl: 60000,
  };

  await rest.auth.requestToken(tokenParams, (err, token) => {
    if (err) {
      res.status(500).send(`Error requesting token: ${JSON.stringify(err)}`);
    } else {
      res.setHeader("Content-Type", "application/json");
      console.log("Token:", {
        token: token.token,
        key: token.keyName,
        issuedTime: new Date(token.issued).toLocaleString(),
        expireTime: new Date(token.expires).toLocaleString(),
        capability: token.capability,
      });

      res.send(JSON.stringify(token));
    }
  });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Web server listening on port ${PORT}`);
});
