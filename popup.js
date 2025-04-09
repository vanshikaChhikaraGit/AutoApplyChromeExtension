document.addEventListener("DOMContentLoaded", () => {
  console.log('popup.js')
    const button = document.getElementById("autofillbutton");
  
    if (button) {
      chrome.runtime.sendMessage({
        action:'getUserData'
      });
    } else {
      console.error("Button not found");
    }
  });
  