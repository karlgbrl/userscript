async function handleApiRequest(apiURL, url, method, fallback = null) {
    try {
        const bypassNotify = zenNotify.notify("Bypassing", url, null, { countdown: true, countdownText: `Please wait until the bypass is done.`});
        const response = await fetch(apiURL, {
            headers: {
                "x-script-key": config().apikey
            }
        });

        if (!response.ok) {
            const data = await response.json();
            console.error(`API request failed:`, response.status, data);
            if (fallback){
                zenNotify.notify("Failed to Bypass", `${data.message || data.result}\nCalling Fallback Bypass API #2`, 2000, { type: "status" });
                console.log(`Failed to Bypass API #1`, `Calling Fallback Bypass API #2`);
                bypassNotify.close();
                return await fallback(url, method === 'refresh');
            }
            bypassNotify.close();
            zenNotify.notify("API Failed", data.message || data.result, 10*1000, {
                type: "error"
            });
            console.error(`Bypass Error:`, data.message || data.result);
            return false;
        }

        const data = await response.json();
        if (data && data.result) {
            bypassNotify.close();
            return data;
        } else {
            bypassNotify.close();
            console.error("Result or Status missing. Response:", data);
            return false;
        }
    } catch (err) {
        console.log("ERROR", err);
        return false;
    }
}

async function fallbackBypassAdlink(url, refresh = false) {
    const apiURL = `https://z.rezz.lol/bypass/fallback?url=${encodeURIComponent(url)}&method=${refresh ? 'refresh' : 'bypass'}`;
    return handleApiRequest(apiURL, url, refresh ? 'refresh' : 'bypass');
}

async function bypassAdLink(url, refresh = false) {
    const apiURL = `https://z.rezz.lol/bypass?url=${encodeURIComponent(url)}&method=${refresh ? 'refresh' : 'bypass'}`;
    return handleApiRequest(apiURL, url, refresh ? 'refresh' : 'bypass', fallbackBypassAdlink);
}

async function handlePlatoboostLink(url, linkto) {
    const apiURL = `https://z.rezz.lol/bypass/platoboost?origin=${encodeURIComponent(url)}&linkTo=${encodeURIComponent(linkto)}`;
    try {
        const t = await fetch(apiURL);
        if (!t.ok) 
            throw new Error("Failed to fetch");
        
        const data = await response.json();
        return data;
    } catch (err) {
        console.log("ERROR", err);
        zenNotify.notify("Error", "error occured, contact @karlgbrl on discord.", 10*1000,{type:"error"});
        return false;
    }
}
