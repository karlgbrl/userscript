if (document.title == 'Just a moment...') {
    return;
}

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

async function checkPlatoboostStatus(url){
    const ticket = extractPlatoTicket(url);
    if (ticket){
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const apiUrl = `https://${domain}/api/session/status?ticket=${ticket}`;
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            if (responseData.data && responseData.data.key) {
                if (responseData.data.key === "KEY_NOT_FOUND" || responseData.data.minutesLeft === 0) {
                    return false;
                } else if (responseData.data.key.startsWith("FREE_") || responseData.data.minutesLeft > 0) {
                    return {res: responseData.data.key};
                }
            } else if (responseData.message.includes('claim timestamp check failed')) {
                return {res: false};
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
                headers: { 'Content-Type': 'application/json' },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const responseData = await response.json(); // Await JSON parsing
            const data = responseData.data;
            return data;
        } catch (error){
            console.log("Error: ", error);
        }
    }
}

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

async function bypassRequest(url) {
    try {
        const response = await fetch(`https://api.gabcode.dev/bypass?url=${encodeURIComponent(url)}&key=${config().apikey}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        });
        
    } catch (err) {
        console.log(err);
    }
}

async function handlePlatoboost(url) { // Async function for Platoboost
    const ticket = extractPlatoTicket(url);
    if (await handlePlatoboostKeyCheck(url)) {
        return;
    }

    if (ticket) {
        const metadata = await getMetaDataPlatoboost(url);
        const checkpoints = metadata['activeRevenueProfile']['checkpointCount'];
        const completed = metadata['completed'];
        const currentService = metadata['activeRevenueProfile']['service'];
        // This means completed/checkpoints so possibly 0/1 OR 0/2 (2 checkpoints to check)
        const urlObj = new URL(url);
        const domain = urlObj.hostname;
        const apiUrl = `https://${domain}/api/session/step?ticket=${ticket}&service=${currentService}`;
        try {
            const response = await fetch(apiUrl, { // Await fetch
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captcha: null, reference: "empty", payload: "empty" }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json(); // Await JSON parsing
            const linkToBypass = data.data.url;
            if (linkToBypass === "about:blank") {
                if (await handlePlatoboostKeyCheck(window.location.href)) { // Key check after redirect
                    return;
                } else {
                    handlePlatoboost(window.location.href);
                    return;
                }
            }
            // console.log("Platoboost API Response:", data);
            // console.log("Link to Bypass:", linkToBypass);

            const bypassed = await bypassLink(linkToBypass); // Await bypassLink

            // console.log(`Got Result:`, bypassed);
            await notifyUser("Redirecting", "Moving to a new URL", 2000);
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

(function() {
    const url = window.location.href;

    if (url.startsWith("https://auth.platoboost.com/") || url.startsWith("https://auth.platoboost.net/")) {
        handlePlatoboost(url);
    }
})()
