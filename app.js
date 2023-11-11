import fetch from "node-fetch";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors()); // Enable CORS for all routes
app.use(express.static("public"));
app.use(express.json());

const API_URL = "http://api.gpt.dtweave.com/completions/gpt4v1/stream/app";
const AUTH_TOKEN = "basic-auth-token";

// Async function to send a message to the API and stream the response
async function sendMessageToAPI(message, id, res) {
  const data = {
    appId: "0",
    model: "GPT_3_5_TURBO_16K",
    sessionId: "7B166284-A820-48A4-B317-2558E4DFED70",
    contents: message,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
        userId: id,
        locale: "it",
      },
    });

    // Pipe the response stream directly to the client
    response.body.pipe(res);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error in processing your message");
  }
}

// Express route to handle streaming response
app.post("/chatbot", async (req, res) => {
  const userMessage = req.body.message;
  const userId = req.body.id;

  //   console.log(userMessage, userId);
  await sendMessageToAPI(userMessage, userId, res);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
