document.addEventListener("DOMContentLoaded", () => {
  console.log('popup.js');
  const button = document.getElementById("autofillbutton");
  
  if (button) {
      button.addEventListener("click", async () => {
          try {
              // Don't expect a response here - the background will handle everything
              chrome.runtime.sendMessage({ action: 'getUserData' });
          } catch (error) {
              console.error("Error sending message:", error);
          }
      });
  } else {
      console.error("Button not found");
  }
});