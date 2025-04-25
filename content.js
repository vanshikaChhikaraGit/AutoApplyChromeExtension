const Handlers = {
    text: {
        selector: "input[type='text'], input[type='email'], input[type='number'], input[type='tel'], input[type='url']",
        fill: (element, answer) => {
            element.value = answer;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    },
    textarea: {
        selector: "textarea",
        fill: (element, answer) => {
            element.value = answer;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
};

function normalize(s){
    const fillerWords = ['your', 'enter', 'the', 'please', 'provide', 'type', 'write', 'input', 'give',
    'details', 'information', 'info', 'a', 'an', 'to', 'fill', 'of', 'add',
    'complete', 'required', 'field', 'optional']

    return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, '')
    .split('\s+')
    .filter(word=>word&& !fillerWords.includes(word))
    .join(' ')
    .trim()
}
const threshold = 79
function getBestMatch(formTitle, data) {
    const normalizedTitle = normalize(formTitle)
    let bestMatch = null;
    let bestScore = 0;

    for (const key in data) {
        const normalizedKey = normalize(key)

        if(normalizedKey.includes(normalizedTitle)||normalizedTitle.includes(normalizedKey)){
            console.log(`✅ Best match for "${formTitle}": ${key} with score ${100}`);
            return key
        }
        const score = findSimilarityScore(normalizedTitle.trim().toLowerCase(),normalizedKey.trim().toLowerCase());
        console.log(`Matching "${formTitle}" with "${key}" → score: ${score.toFixed(2)}`);

        if (score > threshold && score > bestScore) {
            bestScore = score;
            bestMatch = key;
        }
    }

    console.log(`✅ Best match for "${formTitle}": ${bestMatch} with score ${bestScore}`);
    return bestMatch;
}



function findSimilarityScore(a,b){
    const maxLength = Math.max(a.length,b.length);
    const similarityLength = levDist(a,b)

    return (1-similarityLength/maxLength)*100;

}

function levDist(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            if (a[i - 1] === b[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j],     // deletion
                    dp[i][j - 1],     // insertion
                    dp[i - 1][j - 1]  // replacement
                ) + 1;
            }
        }
    }

    return dp[a.length][b.length];
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
        console.log('fillForm received in content script');
        const data = request.data;
        if (window.location.hostname.includes("docs.google.com") && window.location.pathname.includes("/forms")) {
            autofillGoogleForm(data.userInfo);
        } else {
            autofillGenericForm(data.userInfo);
        }
        sendResponse({ success: true }); // This ensures the message is acknowledged
    }
});

// chrome.runtime.onMessage.addListener((request)=>{
//     console.log('content.js')
//     if(request.action==='fillForm'){
//       const data = request.data
//       console.log(data)
//       if (
//         window.location.hostname.includes("docs.google.com") &&
//         window.location.pathname.includes("/forms")
//       ) {
//         autofillGoogleForm(data);
//       } else {
//         autofillGenericForm(data);
//       }
//     }
// })
let form;
function autofillGoogleForm(data) {
    form = document.querySelector('form')
    if (!form) {
        console.error("❌ Google Form not found on the page.");
        return;
    }

    Object.values(Handlers).forEach(handler=>{
        //get the google form 
        const fields = form.querySelectorAll(handler.selector)
        console.log(fields)
        //iterate over all form elelemnts
        fields.forEach(field=>{
            //div containg the input elements headings
            const formTitleElement = field.closest("div[role='listitem']")?.querySelector("div[role='heading']");
            console.log(formTitleElement)
            if (!formTitleElement || !formTitleElement.firstChild) return;
//form title = first child of the div
                const formTitle = formTitleElement.firstChild.textContent.trim();
                console.log(formTitle)

                //find the best match from the user data
                const findBestMatch = getBestMatch(formTitle,data)
                console.log(findBestMatch)
                if(findBestMatch){
                    const answer = data[findBestMatch]
                    console.log(answer)
                  handler.fill(field,answer)
                  console.log('form filled')
                }
        })

    })
  }
  
  