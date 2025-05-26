// ==UserScript==
// @name         UnsafeWindow Alert
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Alerts if unsafeWindow is available.
// @author       You
// @match        *://*/*
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    if (typeof unsafeWindow !== 'undefined' && unsafeWindow !== null) {
        alert("unsafeWindow IS available!");
    }

})();
