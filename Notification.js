const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    throw new Error(`Cookie "${name}" not found`);
}

function autoclickrecaptcha(){var e=!1,t=!1,n=!1;let o=".recaptcha-checkbox-border",r="#recaptcha-audio-button",c="#audio-source",l=".rc-audiochallenge-response-field",a=".rc-audiochallenge-error-message",i="#audio-response",s="#recaptcha-reload-button",g="#recaptcha-accessible-status",u=".rc-doscaptcha-body",h="#recaptcha-verify-button";var p=0,d=_("html").getAttribute("lang"),$="",f=_(g)?_(g).innerText:"",m=["https://engageub.pythonanywhere.com","https://engageub1.pythonanywhere.com"],y=Array(m.length).fill(1e4);function T(e){return null===e.offsetParent}try{!t&&_(o)&&!T(_(o))&&(_(o).click(),t=!0),_(g)&&_(g).innerText!=f&&(e=!0,console.log("SOLVED")),p>5&&(console.log("Attempted Max Retries. Stopping the solver"),e=!0),_(u)&&_(u).innerText.length>0&&console.log("Automated Queries Detected")}catch(x){console.log(x.message),console.log("An error occurred while solving. Stopping the solver.")}async function v(e){var t=1e5,o="";for(let l=0;l<y.length;l++)y[l]<=t&&(t=y[l],o=m[l]);p+=1,e=e.replace("recaptcha.net","google.com"),d.length<1&&(console.log("Recaptcha Language is not recognized"),d="en-US"),console.log("Recaptcha Language is "+d),GM_xmlhttpRequest({method:"POST",url:o,headers:{"Content-Type":"application/x-www-form-urlencoded"},data:"input="+encodeURIComponent(e)+"&lang="+d,timeout:6e4,onload:function(e){console.log("Response::"+e.responseText);try{if(e&&e.responseText){var t=e.responseText;"0"==t||t.includes("<")||t.includes(">")||t.length<2||t.length>50?console.log("Invalid Response. Retrying.."):_(c)&&_(c).src&&$==_(c).src&&_(i)&&!_(i).value&&"none"==_(r).style.display&&_(h)?(_(i).value=t,_(h).click()):console.log("Could not locate text input box"),n=!1}}catch(o){console.log(o.message),console.log("Exception handling response. Retrying.."),n=!1}},onerror:function(e){console.log(e),n=!1},ontimeout:function(){console.log("Response Timed out. Retrying.."),n=!1}})}async function b(e){var t=new Date().getTime();GM_xmlhttpRequest({method:"GET",url:e,headers:{"Content-Type":"application/x-www-form-urlencoded"},data:"",timeout:8e3,onload:function(n){if(n&&n.responseText&&"0"==n.responseText){var o=new Date().getTime()-t;for(let r=0;r<m.length;r++)e==m[r]&&(y[r]=o)}},onerror:function(e){console.log(e)},ontimeout:function(){console.log("Ping Test Response Timed out for "+e)}})}function w(e){return document.querySelectorAll(e)}function _(e){return document.querySelector(e)}if(_(o))_(o).click();else if(window.location.href.includes("bframe"))for(let R=0;R<m.length;R++)b(m[R]);var S=setInterval(function(){try{!t&&_(o)&&!T(_(o))&&(_(o).click(),t=!0),_(g)&&_(g).innerText!=f&&(e=!0,console.log("SOLVED"),clearInterval(S)),p>5&&(console.log("Attempted Max Retries. Stopping the solver"),e=!0,clearInterval(S)),!e&&(_(r)&&!T(_(r))&&_("#rc-imageselect")&&_(r).click(),!n&&_(c)&&_(c).src&&_(c).src.length>0&&$==_(c).src&&_(s)||_(a)&&_(a).innerText.length>0&&_(s)&&!_(s).disabled?_(s).click():!n&&_(l)&&!T(_(l))&&!_(i).value&&_(c)&&_(c).src&&_(c).src.length>0&&$!=_(c).src&&p<=5&&(n=!0,$=_(c).src,v($))),_(u)&&_(u).innerText.length>0&&(console.log("Automated Queries Detected"),clearInterval(S))}catch(h){console.log(h.message),console.log("An error occurred while solving. Stopping the solver."),clearInterval(S)}},5e3)}

const isValidURL = (urlString) => {
    try {
        const url = new URL(urlString);
        const isWebProtocol = url.protocol === 'http:' || url.protocol === 'https:';
        const hasValidHostname = url.hostname && url.hostname !== '';
        const isNotSpecialScheme = !['javascript:', 'data:', 'mailto:', 'tel:', 'blob:'].includes(url.protocol);
        const hasCorrectStructure = url.pathname === '/' || url.pathname.startsWith('/') && !url.pathname.startsWith('//');
        return isWebProtocol && hasValidHostname && isNotSpecialScheme && hasCorrectStructure;
    } catch (e) {
        return false;
    }
}

async function waitClickButton(timer = 0, redirectURL) {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(15, 15, 15, 0.85);
        z-index: 99999999999999999;
        display: flex;
        color: #fff;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;

    const timerDisplay = document.createElement("div");
    timerDisplay.style.cssText = `
        font-size: 24px;
        color: #eee;
        margin-bottom: 15px;
        font-family: 'Segoe UI', sans-serif !important;
        font-weight: 900 !important;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
    `;

    const bypassButton = document.createElement("button");
    bypassButton.textContent = "Bypass";
    bypassButton.style.cssText = `
        padding: 15px 30px;
        font-size: 16px;
        border: none;
        background-color: #007bff;
        font-family: 'Segoe UI', sans-serif !important;
        font-weight: 700 !important;
        color: #fff;
        cursor: pointer;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease-in-out;
        opacity: 0;
        transform: translateY(15px);
        display: none;
    `;

    bypassButton.style.backgroundImage = "linear-gradient(135deg, #007bff, #0056b3)";
    bypassButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";

    bypassButton.addEventListener("mouseover", () => {
        bypassButton.style.transform = "scale(1.05)";
        bypassButton.style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.2)";
    });

    bypassButton.addEventListener("mouseout", () => {
        bypassButton.style.transform = "scale(1)";
        bypassButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        bypassButton.style.backgroundColor = "#007bff";
        bypassButton.style.backgroundImage = "linear-gradient(135deg, #007bff, #0056b3)";
    });

    bypassButton.addEventListener("click", () => {
        window.location.href = redirectURL;
    });

    overlay.appendChild(timerDisplay);
    overlay.appendChild(bypassButton);
    document.body.appendChild(overlay);

    timerDisplay.textContent = `Wait: ${timer}s`;

    while (timer > 0) {
        await sleep(1000);
        timer--;
        timerDisplay.textContent = `Wait: ${timer}s`;
    }

    if (timer <= 0) {
        timerDisplay.textContent = "Tap to Continue";
        bypassButton.style.display = "block";
        requestAnimationFrame(() => {
            bypassButton.style.opacity = '1';
            bypassButton.style.transform = 'translateY(0)';
        });
    }
}

function getAdLink() {
    let form = document.getElementsByTagName('form')[0];
    let data = new FormData(form);
    return new Promise(async (resolve, reject) => {
        GM_xmlhttpRequest({
            method: "POST",
            url: form.action,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': window.location.href,
            },
            data: new URLSearchParams(data),
            onload: function(response) {
                resolve(response.finalUrl);
            },
            onerror: function(error) {
                const match = error?.error?.match(/"https?:\/\/[^"]+"/);
                if (match) {
                    const finalUrl = match[0].replace(/"/g, "");
                    resolve(finalUrl);
                } else {
                    reject(error);
                }
            }
        });
    });
}
