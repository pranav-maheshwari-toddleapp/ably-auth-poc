import "./App.css";
import * as Ably from "ably/browser/static/ably-commonjs";

const USER_ID = "17740098669908281";

function App() {
  let ablyClient;
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
      printTokenDetails();
    });

    setInterval(printTokenDetails, 60000);
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <button onClick={() => establishConnection()}>
            Establish connection
          </button>
        </p>
      </header>
    </div>
  );
}

export default App;
