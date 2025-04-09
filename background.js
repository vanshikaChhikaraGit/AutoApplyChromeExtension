chrome.runtime.onMessage.addListener(function (request,sender,sendResponse) {
    console.log('background.js')
    if(request.action==='getUserData'){
        try {
            const userData= {
                    fullName: "Vanshika Chhikara",
                    email: "vanshika@example.com",
                    phone: "9876543210",
                    address: "123, New Delhi",
                    dob:"17/12/2005"
            }

           chrome.tabs.query({currentWindow:true,active:true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "fillForm",
                data: userData,
              });
           });
        } catch (error) {
            console.error(error)
        }
    }
});