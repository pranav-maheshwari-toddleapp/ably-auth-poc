import "./App.css";
import * as Ably from "ably/browser/static/ably-commonjs";
import { useState } from "react";
import { JWT_USERS } from "./constants";

let ablyClient;
let channel;

function App() {
  const [connectionEstablished, setConnectionEstablished] = useState(false);
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [presenceUser, setPresenceUser] = useState(null);
  const [disable, setDisable] = useState(false);

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
        presenceUser,
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

      ablyClient.connection.once("connected", () => {
        console.log("connected");
        setConnectionEstablished(true);
        setUser(userData);
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

  const shouldDisable = (currentUser) => {
    if (user && currentUser) {
      return (
        user.id !== currentUser.id ||
        userName !== currentUser.name ||
        user.type !== currentUser.type
      );
    }

    return false;
  };

  const subscribeChannel = () => {
    if (channel) {
      setSubscribed(true);
      channel.subscribe((message) => {
        console.log("Received message: ", message);
        setMessages((messages) => [...messages, message.data]);
      });
      channel.presence.subscribe(["enter", "leave", "update"], (message) => {
        console.log("Presence event received: ", message);
        handlePresenceEvents(message);
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

  const handlePresenceEvents = (presenceEvent) => {
    const { action, data } = presenceEvent;
    if (action === "enter") {
      setPresenceUser(data);
      setDisable(shouldDisable(data));
    } else if (action === "leave") {
      setPresenceUser(null);
      setDisable(false);
    }
  };

  const handlePresenceChange = (isPresent) => {
    if (channel && subscribed && user) {
      if (isPresent) {
        channel.presence.enter({
          id: user.id,
          name: userName,
          type: user.type,
        });
      } else {
        channel.presence.leave();
      }
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {!connectionEstablished ? (
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
          ) : (
            <>
              <span>
                Connection established as{" "}
                <strong>
                  {userName}({user.type})
                </strong>
              </span>
              <br />
              <br />
              {!subscribed ? (
                <button onClick={() => subscribeChannel()}>
                  Subscribe to channel
                </button>
              ) : (
                <>
                  <span>Subscribed to the channel</span>
                  <br />
                  <br />
                  <input
                    type="text"
                    value={message}
                    disabled={disable}
                    onFocus={() => handlePresenceChange(true)}
                    onBlur={() => handlePresenceChange(false)}
                    onChange={handleInputChange}
                  />{" "}
                  &nbsp;
                  <button disabled={disable} onClick={() => publishMessage()}>
                    Publish Message
                  </button>
                  {disable && (
                    <>
                      <br />
                      <span style={{ color: "yellow" }}>
                        {" "}
                        <strong>
                          {presenceUser.name} - {presenceUser.id} (
                          {presenceUser.type})
                        </strong>{" "}
                        is typing...{" "}
                      </span>
                    </>
                  )}
                  <br />
                  <br />
                  {messages.map((message, index) => (
                    <div id={index}>
                      <h4 style={{ display: "inline" }}>{message.user}</h4>{" "}
                      &rarr; <span>{message.message}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
