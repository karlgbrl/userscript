// ==UserScript==
// @name        GabCode Bypasser
// @namespace   http://tampermonkey.net/
// @version     0.5.3
// @description Auto Bypass Platoboost, Panda, KeyRBLX, KeyGuardian and more.
// @author      Gabriel
// @match       *://linkvertise.com/*/*
// @match       *://linkvertise.com/?iwantbypass=*
// @match       *://loot-link.com/s?*
// @match       *://loot-links.com/s?*
// @match       *://lootlink.org/s?*
// @match       *://lootlinks.co/s?*
// @match       *://lootdest.info/s?*
// @match       *://lootdest.org/s?*
// @match       *://lootdest.com/s?*
// @match       *://links-loot.com/s?*
// @match       *://linksloot.net/s?*
// @match       *://auth.platoboost.com/*
// @match       *://auth.platoboost.net/*
// @match       *://spdmteam.com/*
// @match       *://mobile.codex.lol/*
// @match       *://flux.li/*
// @match       *://keyguardian.org/a/*
// @match       *://keyrblx.com/getkey/*
// @match       *://pandadevelopment.net/*
// @match       *://krnl.cat/*
// @match       *://rekonise.com/*
// @match       *://www.nixius.xyz/*
// @match       *://trigonevo.fun/whitelist/*
// @match       https://*.hcaptcha.com/*checkbox*
// @match       https://*.hcaptcha.com/*hcaptcha-challenge*
// @match       https://*.hcaptcha.com/*captcha*
// @icon        https://w0.peakpx.com/wallpaper/874/748/HD-wallpaper-anime-app-icon-anime-app-icon.jpg
// @license     Gabriel
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://update.greasyfork.org/scripts/421384/1134973/GM_fetch.js
// @require     https://github.com/karlgbrl/userscript/raw/refs/heads/main/notifyuser.js
// @require     https://github.com/karlgbrl/userscript/raw/refs/heads/main/Main.js
// @connect     api.gabcode.dev
// @connect     auth.platoboost.com
// @connect     auth.platoboost.net
// @connect     linkvertise.com
// @connect     loot-link.com
// @connect     lootdest.org
// @connect     linksloot.com
// @connect     lootdest.com
// @connect     spdmteam.com
// @connect     api.codex.lol
// ==/UserScript==

function config() {
    const apikey = '';
    return {
        redirect: {
            wait: 5, // Wait time before redirecting to the URL
            luarmorSleep: 25, // Wait time before redirecting to Luarmor
            enabled: true
        },
        apikey: apikey // enter your api
    }
}
function copyconfig() {
    return {
        platoboost: true, // Auto Copy Platoboost Key
        fluxus: true, // Auto Copy Fluxus Key
        keyguardian: true, // Auto Copy Keyguardian Key
        pandadevelopment: true, // Auto Copy Pandadevelopment Key
        keyrblx: true, // Auto Copy Keyrblx Key
        krnl: true, // Auto Copy KRNL KEY
        nixius: true, // Auto Copy Nixius KEY
    }
}

function fallback_check() {
    return {
        codex: true // If authenticated detected, it will recheck in API.
    }
}
