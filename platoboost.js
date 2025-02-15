if (document.title == 'Just a moment...') {
    return;
}

async function checkapikey() {
    try {
        const response = await fetch(`https://api.gabcode.dev/key`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'x-api-key': config().apikey
            }
        });
        if (!response.ok) {
            const errorText = await response.text(); // Get error details
            console.error(`API key check failed: ${response.status} - ${errorText}`);
            return false; // Or throw an error if you prefer
        }
        const data = await response.json(); // Parse JSON response
        return true; // Or return data if needed

    } catch (error) {
        console.error("Error checking API key:", error); // Network or other error
        return false;
    }
}

async function bypassRequest(url) {
    try {
        const response = await fetch(`https://api.gabcode.dev/bypass?url=${encodeURIComponent(url)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': config().apikey
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API request failed:`, response.status, errorText);
            throw new Error(`Bypass failed: API error (${response.status} - ${errorText})`);
        }
        const data = await response.json();
        if (data) {
            return data; // returns data.result and data.success
        } else {
            console.error("Result or Status missing. Response:", data);
            throw new Error("Bypass failed: Result or Status missing."); // Don't retry on this error
        }
    } catch (err) {
        console.log(err);
        throw err; // Re-throw, either max retries reached or it's not an API error
    }
}

async function handlePlatoboost(url) { // Async function for Platoboost
    function extractPlatoTicket(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            if (pathParts.length > 1) {
                return pathParts[1];
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    const ticket = extractPlatoTicket(url);

    async function handlePlatoboostKeyCheck(url) {
        const data = await checkPlatoboostStatus(url);
        if (data) {
            if (data.res) {
                if (copyconfig().platoboost) {
                    GM_setClipboard(data.res);
                    await notifyUser("Copied Key", data.res, 60 * 1000, false, data.res);
                } else {
                    console.log(`Already got key!`);
                    await notifyUser("Got Key", data.res, 60 * 1000, false, data.res);
                }
            } else {
                await notifyUser("Expired Link Detected", "Bypass Failed, Request for a new link.", 10 * 1000, null, "Bypass Failed, Request for a new link.");
            }
            return true;
        } else {
            return false;
        }
    }

    async function checkPlatoboostStatus(url) {
        const ticket = extractPlatoTicket(url);
        if (ticket) {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const apiUrl = `https://${domain}/api/session/status?ticket=${ticket}`;
            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
    
                const responseData = await response.json();
                if (responseData.data && responseData.data.key) {
                    if (responseData.data.key === "KEY_NOT_FOUND" || responseData.data.minutesLeft === 0) {
                        return false;
                    } else if (responseData.data.key.startsWith("FREE_") || responseData.data.minutesLeft > 0) {
                        return {
                            res: responseData.data.key
                        };
                    }
                } else if (responseData.message.includes('claim timestamp check failed')) {
                    return {
                        res: false
                    };
                }
            } catch (Error) {
                console.log("Error Check Platoboost Status:", Error);
            }
        } else {
            console.log("Failed to get Ticket");
        }
    }
    
    async function getMetaDataPlatoboost(url) {
        const ticket = extractPlatoTicket(url);
        if (ticket) {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            const apiUrl = `https://${domain}/api/session/metadata?ticket=${ticket}`;
            try {
                const response = await fetch(apiUrl, { // Await fetch
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const responseData = await response.json(); // Await JSON parsing
                const data = responseData.data;
                return data;
            } catch (error) {
                console.log("Error: ", error);
            }
        }
    }

    if (await handlePlatoboostKeyCheck(url)) {
        return;
    }

    if (ticket) {
        const metadata = await getMetaDataPlatoboost(url);
        // const checkpoints = metadata['activeRevenueProfile']['checkpointCount'];
        // const completed = metadata['completed'];
        const currentService = metadata['activeRevenueProfile']['service'];
        // This means completed/checkpoints so possibly 0/1 OR 0/2 (2 checkpoints to check)
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const apiUrl = `https://${domain}/api/session/step?ticket=${ticket}&service=${currentService}`;
        try {
            const response = await fetch(apiUrl, { // Await fetch
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    captcha: null,
                    reference: "empty",
                    payload: "empty"
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }


            const data = await response.json();
            if (!data.success && data.message.includes('a key for this identifier already exists.')) {
                window.location.reload();
                return;
            } else if (data.success && data.message.includes('please complete the captcha')) {
                notifyUser("Captcha Detected", "Solve the captcha", 3000);
                return;
            }

            const linkToBypass = data.data.url;
            if (linkToBypass === "about:blank") {
                if (await handlePlatoboostKeyCheck(window.location.href)) {
                    return;
                } else {
                    handlePlatoboost(window.location.href);
                    return;
                }
            }

            const bypassed = await bypassRequest(linkToBypass); // Await bypassLink

            await notifyUser("Redirecting", "Moving to a new URL", 1.5 * 1000);
            if (bypassed && bypassed.result) {
                window.location.href = bypassed.result;
                if (await handlePlatoboostKeyCheck(window.location.href)) {
                    return;
                } else {
                    handlePlatoboost(window.location.href);
                    return;
                }
            } else {
                console.error("Bypass failed or result is missing:", bypassed);
                alert("Bypass failed. Check the console for details.");
            }
        } catch (error) {
            console.error("Platoboost API or bypass error:", error);
        }
    } else {
        console.log("Failed to get Platoboost Ticket");
    }
}

async function handleCodex() {
    let session;
    while (!session) {
        session = localStorage.getItem("android-session");
        await sleep(1000);
    }
    if (document?.getElementsByTagName('a')?.length && document.getElementsByTagName('a')[0] && document.getElementsByTagName('a')[0].innerHTML.includes('Get started')) {
        document.getElementsByTagName('a')[0].click();
    }
    async function getStages() {
        let response = await fetch('https://api.codex.lol/v1/stage/stages', {
            method: 'GET',
            headers: {
                'Android-Session': session
            }
        });
        let data = await response.json();

        if (data.success) {
            if (data.authenticated) {
                return [];
            }
            return data.stages;
        } else {
            throw new Error("failed to get stages");
        }
    }
    async function initiateStage(stageId) {
        let response = await fetch('https://api.codex.lol/v1/stage/initiate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                stageId
            })
        });
        let data = await response.json();

        if (data.success) {
            return data.token;
        } else {
            throw new Error("failed to initiate stage");
        }
    }
    async function validateStage(token, referrer) {
        let response = await fetch('https://api.codex.lol/v1/stage/validate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json',
                'Task-Referrer': referrer
            },
            body: JSON.stringify({
                token
            })
        });
        let data = await response.json();

        if (data.success) {
            return data.token;
        } else {
            throw new Error("failed to validate stage");
        }

    }
    async function authenticate(validatedTokens) {
        let response = await fetch('https://api.codex.lol/v1/stage/authenticate', {
            method: 'POST',
            headers: {
                'Android-Session': session,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tokens: validatedTokens
            })
        });
        let data = await response.json();

        if (data.success) {
            return true;
        } else {
            throw new Error("failed to authenticate");
        }
    }

    function decodeTokenData(token) {
        let data = token.split(".")[1];
        data = base64decode(data);
        return JSON.parse(data);
    }

    let stages = await getStages();
    let stagesCompleted = 0;
    while (localStorage.getItem(stages[stagesCompleted]) && stagesCompleted < stages.length) {
        stagesCompleted++;
    }
    if (stagesCompleted == stages.length) {
        const authenticatedMessage = document.querySelector("span.text-gray-500").textContent;
        if (authenticatedMessage) {
            notifyUser("Successfully Authenticated", "", 10 * 1000, null, "Successfully Authenticated");
        }
        return;
    }

    let validatedTokens = [];
    try {
        while (stagesCompleted < stages.length) {
            let stageId = stages[stagesCompleted].uuid;
            let initToken = await initiateStage(stageId);

            await sleep(6000);

            let tokenData = decodeTokenData(initToken);
            let referrer;
            if (tokenData.link.includes('loot-links')) {
                referrer = 'https://loot-links.com/';
            } else if (tokenData.link.includes('loot-link')) {
                referrer = 'https://loot-link.com/';
            } else {
                referrer = 'https://linkvertise.com/';
            }

            let validatedToken = await validateStage(initToken, referrer);
            validatedTokens.push({
                uuid: stageId,
                token: validatedToken
            });
            notifyUser(`Stage completed`, `${stagesCompleted + 1}/${stages.length} stages`, 5000);

            await sleep(1500);

            stagesCompleted++;
        }
        if (authenticate(validatedTokens)) {
            notifyUser('Bypassed Successfully', 'Refreshing Page', 3000);
            await sleep(3000);
            window.location.reload();
        }
    } catch (e) {
        notifyUser("Error", e, 7000);
        handleError(e);
    }
}

var pageTitle = document.title;
const url = window.location.href;
var arceusNewURL = url.replace('https://linkvertise.com/376138/arceus-x-neo-key-system-1?o=sharing', 'https://lootdest.com/s?qljL');
var ARCEUS_API = `https://spdmteam.com/api/keysystem?step=`;

async function start() {
    const apicheck = await checkapikey();
    if (!apicheck) {
        notifyUser("Invalid API Key", ``, 10 * 1000);
        return;
    }
    if (url.startsWith("https://auth.platoboost.com/") || url.startsWith("https://auth.platoboost.net/")) {
        handlePlatoboost(url);
        return;
    } else if (url.startsWith("https://mobile.codex.lol")) {
        handleCodex()
    } else if (url.includes("https://linkvertise.com/376138/arceus-x-neo-key-system-1?o=sharing")){
        window.location.replace(arceusNewURL);
    } else if (pageTitle.includes("NEO") && pageTitle.includes("1")) {
        window.location.href = ARCEUS_API + "1&advertiser=linkvertise&OS=ios";
    } else if (url.includes("https://spdmteam.com/key-system-2?hwid=")) {
        window.location.replace("https://loot-link.com/s?mYit");
    } else if (pageTitle.includes("NEO") && pageTitle.includes("2")) {
        window.location.replace("https://spdmteam.com/api/keysystem?step=2&advertiser=linkvertise&OS=ios");
    } else if (url.includes("https://spdmteam.com/key-system-3?hwid=")) {
        window.location.replace("https://loot-link.com/s?qlbU");
    } else if (pageTitle.includes("NEO") && pageTitle.includes("3")) {
        window.location.replace("https://spdmteam.com/api/keysystem?step=3&advertiser=linkvertise&OS=ios");
    } else if (url.includes("https://spdmteam.com/key-system-getkey")) {
        notifyUser("Arceus Bypass", "Key System Completed!", 60 * 1000, false, "Key System Completed!");
    }
}

(function() {
    start();
})();
