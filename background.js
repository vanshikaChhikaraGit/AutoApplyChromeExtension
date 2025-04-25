chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'getUserData') {
        console.log("Request received to get user data");

        chrome.cookies.get({ name: "JWT_TOKEN", url: "http://localhost" }, async function (cookie) {
            if (cookie) {
                console.log("JWT token:", cookie.value);

                try {
                    const response = await fetch("http://localhost:3000/api/userdata", {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${cookie.value}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error("Couldn't fetch user data");
                    }
                    const userData = await response.json();
console.log("user data",userData)

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
            action: 'fillForm',
            data: userData
        }, function(response) {
            if (chrome.runtime.lastError) {
                console.error("Message send error:", chrome.runtime.lastError);
            }
        });
    }
});


                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                console.log("JWT token not found");
            }
        });
    }
});
