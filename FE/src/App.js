import "./App.css";
import * as Ably from "ably/browser/static/ably-commonjs";
import { useState } from "react";
import { _ } from "lodash";

let ablyClient;
let channel;

const jwtUsers = {
  admin: {
    id: "63809",
    ut: "staff",
    roles: ["teacher", "admin", "reviewer", "dev_mode"],
    oid: "1251",
    region: "eu-west-1",
    i_id: "100843",
    v: "2",
    iat: 1696482145,
  },
  staff: {
    id: "36625309834946929",
    ut: "staff",
    roles: ["teacher"],
    oid: "1251",
    region: "eu-west-1",
    iid: "36625309813979978",
    i_id: "36625309813979978",
    v: "2",
    iat: 1696495610,
  },
  student: {
    id: "27225404611765454",
    ut: "student",
    roles: ["student"],
    oid: "1251",
    region: "eu-west-1",
    v: "2",
    iat: 1696494939,
  },
  parent: {
    id: "36624262584346992",
    ut: "parent",
    roles: ["parent"],
    oid: "1251",
    region: "eu-west-1",
    v: "2",
    iat: 1696495280,
  },
};

function App() {
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [message, setMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [messages, setMessages] = useState([]);

  const userType = "admin"; // dynamic from front end
  const jwtUser = _.isEmpty(_.trim(userType))
    ? { id: null }
    : jwtUsers[userType];

  const printTokenDetails = () => {
    const tokenDetails = ablyClient.auth.tokenDetails;

    if (tokenDetails) {
      const user = tokenDetails.clientId || "anonymous";
      const capability = tokenDetails.capability;
      const issuedTime = new Date(tokenDetails.issued).toLocaleString();
      const expireTime = new Date(tokenDetails.expires).toLocaleString();
      const token = tokenDetails.token;
      console.log("Time: ", new Date().toLocaleString(), {
        user,
        capability,
        issuedTime,
        expireTime,
        token,
      });
    } else {
      setTimeout(printTokenDetails, 1000);
    }
  };

  const establishConnection = () => {
    if (!ablyClient) {
      console.log("Creating new connection");
      ablyClient = new Ably.Realtime({
        authUrl: "http://localhost:8080/auth",
        authParams: { jwtUser },
      });
    }

    console.log({ ablyClient });
    ablyClient.connection.once("connected", () => {
      console.log("connected");
      setConnectionEstablished(true);
      channel = ablyClient.channels.get("ably-auth-token-chat");
      printTokenDetails();
    });

    setInterval(printTokenDetails, 60000);
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const subscribeChannel = () => {
    console.log({ channel });
    if (channel) {
      setSubscribed(true);
      channel.subscribe((message) => {
        console.log("Received message: ", message);
        setMessages((messages) => [...messages, message.data]);
      });
    }
  };

  const publishMessage = () => {
    if (message && channel) {
      const data = { user: jwtUser.id, message };
      channel.publish("message", data, (err) => {
        alert("Unable to publish message; err = " + err.message);
        console.error("Unable to publish message; err = " + err.message);
      });
      setMessage("");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {connectionEstablished ? (
            <span>Connection established</span>
          ) : (
            <button onClick={() => establishConnection()}>
              Establish connection
            </button>
          )}
          <br />
          <br />
          {subscribed ? (
            <span>Subscribed to the channel</span>
          ) : (
            <button onClick={() => subscribeChannel()}>
              Subscribe to channel
            </button>
          )}
          <br />
          <br />
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
          />{" "}
          &nbsp;
          <button onClick={() => publishMessage()}>Publish Message</button>
          <br />
          <br />
          {messages.map((message, index) => (
            <div id={index}>
              <h4 style={{ display: "inline" }}>{message.user}</h4> &rarr;{" "}
              <span>{message.message}</span>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
