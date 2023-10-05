import "./App.css";
import * as Ably from "ably/browser/static/ably-commonjs";
import { useState } from "react";

const USER_ID = "User-1";
let ablyClient;
let channel;

function App() {
  const [connectionEstablished, setConnectionEstablished] = useState(false);
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

  const establishConnection = () => {
    if (!ablyClient) {
      console.log("Creating new connection");
      ablyClient = new Ably.Realtime({
        authUrl: "http://localhost:8080/auth",
        authParams: { clientId: USER_ID },
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
      const data = { user: USER_ID, message };
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
