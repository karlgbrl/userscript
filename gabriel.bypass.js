// ==UserScript==
// @name        GabCode Platoboost Bypass
// @namespace   http://tampermonkey.net/
// @version     1.2.9
// @description Automatically bypass platoboost
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
// @icon        https://w0.peakpx.com/wallpaper/874/748/HD-wallpaper-anime-app-icon-anime-app-icon.jpg
// @license     Gabriel
// @grant       GM_xmlhttpRequest
// @grant       GM_setClipboard
// @grant       GM_getValue
// @grant       GM_setValue
// @require     https://update.greasyfork.org/scripts/421384/1134973/GM_fetch.js
// @require     https://raw.githubusercontent.com/karlgbrl/userscript/refs/heads/main/notifyuser.js
// @require     https://raw.githubusercontent.com/karlgbrl/userscript/refs/heads/main/platoboost.js
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
            wait: 10, // for luarmor, try 30-40s for safety
            enabled: true
        },
        apikey: apikey // enter your api
    }
}
function copyconfig() {
    return {
        platoboost: true, // auto copy platoboost key
    }
}
