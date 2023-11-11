const submitDom = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-btn");
sendButton.disabled = true;

submitDom.addEventListener("click", async function () {
  if (userInput.value == "") {
    return alert("You must write something!");
  }
  createUserUI("user", userInput.value); // Display user message

  let isLogging = false; // Flag to track logging state
  let botDiv; // Element to display bot's message
  let accumulatedText = ""; // Accumulate text across chunks
  let scrollInterval; // Variable to hold the interval ID

  const postData = {
    method: "POST",
    body: JSON.stringify({ id: 9937773, message: userInput.value }),
    headers: {
      "Content-Type": "application/json", // Specify that the body is JSON
    },
  };

  try {
    const response = await fetch(`https://gpt-clone-eta.vercel.app/chatbot`, postData);
    const reader = response.body.getReader();

    // Start an interval to keep scrolling to the bottom
    scrollInterval = setInterval(() => {
      const chatBox = document.getElementById("chat-box");
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 100); // Adjust the interval time as needed

    // Function to process each chunk
    async function processChunk() {
      const { done, value } = await reader.read();
      if (done) {
        clearInterval(scrollInterval); // Clear the interval when done
        return;
      }

      accumulatedText += new TextDecoder("utf-8").decode(value);
      let match;
      const regex = /data:({.*?})\n\n/g;
      let processedLength = 0;

      while ((match = regex.exec(accumulatedText)) !== null) {
        const data = JSON.parse(match[1]);

        // Create or update botDiv with new message
        if (!botDiv) {
          botDiv = createUserUI("bot", data.msg);
        } else {
          const pText = botDiv.querySelector(".info-user p");
          pText.innerHTML += data.msg;
        }

        processedLength = match.index + match[0].length;
      }

      // Remove processed text
      accumulatedText = accumulatedText.substring(processedLength);

      processChunk(); // Process the next chunk
    }

    await processChunk();
  } catch (error) {
    console.error("Error:", error);
    clearInterval(scrollInterval); // Clear the interval in case of error
  }

  userInput.value = ""; // Clear input field
  sendButton.disabled = true; // Disable send button
});

// Enable button when there's a non-empty string in the input field
userInput.oninput = () => {
  if (userInput.value.length === 0) {
    sendButton.disabled = true;
    sendButton.style.opacity = 0.5;
  } else {
    sendButton.disabled = false;
    sendButton.style.opacity = 1;
  }
};

const createUserUI = (role, text) => {
  const chatBox = document.getElementById("chat-box");
  const divChat = document.createElement("div");
  divChat.className = "chat-user";

  const divCricle = document.createElement("div");
  divCricle.className = role === "bot" ? "circle-bot" : "circle";

  const userInfo = document.createElement("div");
  userInfo.className = "info-user";

  const userName = document.createElement("span");
  userName.innerText = role === "bot" ? "Bot" : "User";

  const pText = document.createElement("p");
  pText.innerHTML = text;

  userInfo.appendChild(userName);
  userInfo.appendChild(pText);

  divChat.appendChild(divCricle);
  divChat.appendChild(userInfo);

  chatBox.appendChild(divChat);

  // Scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;

  return divChat; // Return the created chat element
};
