const express = require("express");
const app = express();
const Ably = require("ably");
const cors = require("cors");
const _ = require("lodash");
app.use(cors());

let count = 1;

const getTokenParams = (jwtUser) => {
  const { id: clientId, ut, roles, oid } = jwtUser;
  // const channelName = `ably-auth-token-chat:${oid}`; // channelName:${oid}

  let capabilities = {};
  if (ut == "staff") {
    capabilities = _.includes(roles, "admin")
      ? {
          [`*`]: ["publish", "subscribe", "presence", "history", "stats"],
        }
      : {
          [`*`]: ["publish", "subscribe", "presence"],
        };
  } else if (ut == "student") {
    capabilities = {
      [`*`]: ["subscribe"],
    };
  } else if (ut == "parent") {
    capabilities = {
      [`*`]: ["subscribe"],
    };
  }

  const tokenParams = {
    clientId,
    capability: capabilities,
    ttl: 60000,
  };

  return tokenParams;
};

app.get("/auth", async (req, res) => {
  console.log(`API called ${count++}`, new Date().toLocaleString());

  const jwtUser = JSON.parse(req.headers.jwtuser);
  const { id: clientId = null } = jwtUser;

  if (_.isNull(clientId)) {
    res.status(500).send("Client ID not found!!!!");
  }

  const rest = new Ably.Rest({ key: "COLp9w.0CNo-Q:9wvmiPdAFHlTQKSO" });
  const tokenParams = getTokenParams(jwtUser);
  // console.log("tokenParams:: ", tokenParams);

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
