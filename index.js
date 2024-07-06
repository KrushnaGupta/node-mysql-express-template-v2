var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
const cors = require("cors");

/* Getting all the db querys */
const { saveUser, findUser, UpdateToken } = require("./models/user");
/* This middle ware checks if the token given by the user is right */
const { authenticate } = require("./middleware/authenticate");

// The code below allows the node js to find the public directory with the index.html file
const publicPath = path.join(__dirname, "./public");
// Node js is using port 3000/ and when you push to cloud it will use process.env.PORT
const port = process.env.PORT || 3000;
const WebSocket = require("ws");
const logger = require("./logger");

// Bodyparser for using json data
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static(publicPath));

// Create a WebSocket server
const wss = new WebSocket.Server({
  server: app.listen(3001, () => {
    console.log(`Server is running on http://localhost:3001`);
  }),
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  // Example: WebSocket message handling
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
    ws.send(`Received: ${message}`);
  });

  // Handle WebSocket disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Enable all CORS requests
app.use(cors());

// Example REST endpoint
app.post("/save-step", (req, res) => {
  // Simulated data from REST API

  // Send data to WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(req.body));
    }
  });
  res.json("OK");
});

// Bodyparser for using json data

/* GET index page */
app.get("/", function (req, res, next) {
  res.render("index");
});

/* This function saves a user to the db
	It uses promises.
 */
app.post("/createUser", (req, res, next) => {
  saveUser(req.body)
    .then((result) => {
      return res.header("x-auth", result.token).send({ email: result.email });
    })
    .catch((e) => {
      return res.status(400).send(e);
    });
});

/* When the user from the front-end wants to use a function,
 The below code is an example of using the word authenticate to see if the
 user is actually authenticated
*/
app.get("/get/me", authenticate, (req, res, next) => {
  res.send(req.user);
});

var server = app.listen(port, () => {
  console.log(`Server is up on ${port}`);
});

module.exports = server;
