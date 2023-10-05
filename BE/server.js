const express = require("express");
const app = express();
const Ably = require("ably");
const cors = require("cors");
const _ = require("lodash");
app.use(cors());

let count = 1;

const getTokenParams = (jwtUser) => {
  const { id, ut, roles, oid } = jwtUser;
  let capabilities = {};
  if (ut == "staff") {
    capabilities = {
      [`channelName:${oid}`]: ["publish", "subscribe", "presence"],
    };
  } else if (ut == "student") {
    capabilities = {
      [`channelName:${oid}`]: ["subscribe"],
    };
  } else if (ut == "parent") {
    capabilities = {
      [`channelName:${oid}`]: ["subscribe"],
    };
  }

  const tokenParams = {
    clientId: id,
    ttl: 60000,
    capability: capabilities,
  };

  return tokenParams;
};

app.get("/auth", async (req, res) => {
  console.log(`API called ${count++}`, new Date().toLocaleString());

  const { jwtUser } = req.query;
  const { id: clientId = null } = jwtUser;

  if (_.isNull(clientId)) {
    res.status(500).send("Client ID not found!!!!");
  }

  const rest = new Ably.Rest({ key: "COLp9w.0CNo-Q:9wvmiPdAFHlTQKSO" });

  const tokenParams = getTokenParams(jwtUser);
  console.log("tokenParams:: ", tokenParams);

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
