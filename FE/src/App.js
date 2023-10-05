import "./App.css";
import * as Ably from "ably/browser/static/ably-commonjs";
import { useState } from "react";

let ablyClient;
let channel;

const JWT_USERS = {
  ADMIN: {
    id: "63809",
    type: "Admin",
    ut: "staff",
    roles: ["teacher", "admin", "reviewer", "dev_mode"],
    oid: "1251",
    region: "eu-west-1",
    i_id: "100843",
    v: "2",
    iat: 1696482145,
  },
  STAFF: {
    id: "36625309834946929",
    type: "Staff",
    ut: "staff",
    roles: ["teacher"],
    oid: "1251",
    region: "eu-west-1",
    iid: "36625309813979978",
    i_id: "36625309813979978",
    v: "2",
    iat: 1696495610,
  },
  STUDENT: {
    id: "27225404611765454",
    type: "Student",
    ut: "student",
    roles: ["student"],
    oid: "1251",
    region: "eu-west-1",
    v: "2",
    iat: 1696494939,
  },
  PARENT: {
    id: "36624262584346992",
    type: "Parent",
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
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [messages, setMessages] = useState([]);

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

  const establishConnection = (userData) => {
    if (userName) {
      if (!ablyClient) {
        console.log("Creating new connection");
        ablyClient = new Ably.Realtime({
          authUrl: "http://localhost:8080/auth",
          authParams: { jwtUser: JSON.stringify(userData) },
        });
      }

      console.log({ ablyClient });
      ablyClient.connection.once("connected", () => {
        console.log("connected");
        setConnectionEstablished(true);
        setUser(user);
        channel = ablyClient.channels.get("ably-auth-token-chat");
        printTokenDetails();
      });

      setInterval(printTokenDetails, 60000);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleUserNameChange = (e) => {
    setUserName(e.target.value);
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
      const data = { user: userName, message };
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
            <span>Connection established as {user.Type}</span>
          ) : (
            <>
              <div>
                <span>Enter your name: </span> &nbsp;
                <input
                  type="text"
                  value={userName}
                  onChange={handleUserNameChange}
                />
              </div>
              <br />
              <br />
              <div>
                <span>Establish connection as: </span> &nbsp;
                <button onClick={() => establishConnection(JWT_USERS.ADMIN)}>
                  Admin
                </button>{" "}
                &nbsp;
                <button onClick={() => establishConnection(JWT_USERS.STAFF)}>
                  Staff
                </button>{" "}
                &nbsp;
                <button onClick={() => establishConnection(JWT_USERS.STUDENT)}>
                  Student
                </button>{" "}
                &nbsp;
                <button onClick={() => establishConnection(JWT_USERS.PARENT)}>
                  Parent
                </button>{" "}
                &nbsp;
              </div>
            </>
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
