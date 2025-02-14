const _0x44fb86 = function () {
  let _0x18fe49 = true;
  return function (_0x4173dd, _0x18c241) {
    const _0x3f73e5 = _0x18fe49 ? function () {
      if (_0x18c241) {
        const _0x55a91d = _0x18c241.apply(_0x4173dd, arguments);
        _0x18c241 = null;
        return _0x55a91d;
      }
    } : function () {};
    _0x18fe49 = false;
    return _0x3f73e5;
  };
}();
(function () {
  _0x44fb86(this, function () {
    const _0x49f108 = new RegExp("function *\\( *\\)");
    const _0x261415 = new RegExp("\\+\\+ *(?:[a-zA-Z_$][0-9a-zA-Z_$]*)", 'i');
    const _0x33f5e9 = _0x48c3f7("init");
    if (!_0x49f108.test(_0x33f5e9 + "chain") || !_0x261415.test(_0x33f5e9 + "input")) {
      _0x33f5e9('0');
    } else {
      _0x48c3f7();
    }
  })();
})();
async function _0x10d33c(_0x1334fe) {
  const _0x2ea5c7 = extractPlatoTicket(_0x1334fe);
  if (_0x2ea5c7) {
    const _0x2bbd69 = new URL(_0x1334fe);
    const _0x2c0ed6 = _0x2bbd69.hostname;
    const _0x3b7170 = 'https://' + _0x2c0ed6 + "/api/session/status?ticket=" + _0x2ea5c7;
    try {
      const _0x350592 = await fetch(_0x3b7170, {
        'method': "GET",
        'headers': {
          '_0x1cf69d': "application/json"
        }
      });
      if (!_0x350592.ok) {
        throw new Error("HTTP error! status: " + _0x350592.status);
      }
      const _0x4b890e = await _0x350592.json();
      if (_0x4b890e.data.key === "KEY_NOT_FOUND" || _0x4b890e.data._0x37fa01 === 0x0) {
        return false;
      } else {
        if (_0x4b890e.data.key.startsWith("FREE_") || _0x4b890e.data._0x37fa01 > 0x0) {
          return _0x4b890e.data.key;
        }
      }
    } catch (_0x3998db) {
      console.log("Error Check Platoboost Status:", _0x3998db);
    }
  } else {
    console.log("Failed to get Ticket");
  }
}
async function _0x9da910(_0x2b6ed7) {
  const _0x117211 = extractPlatoTicket(_0x2b6ed7);
  if (_0x117211) {
    const _0x3c27d7 = new URL(_0x2b6ed7);
    const _0x57a923 = _0x3c27d7.hostname;
    const _0x56228c = "https://" + _0x57a923 + '/api/session/metadata?ticket=' + _0x117211;
    try {
      const _0x319cdf = await fetch(_0x56228c, {
        'method': "GET",
        'headers': {
          '_0x1cf69d': "application/json"
        }
      });
      if (!_0x319cdf.ok) {
        throw new Error("HTTP error! status: " + _0x319cdf.status);
      }
      const _0x381e03 = await _0x319cdf.json();
      const _0x3856cf = _0x381e03.data;
      return _0x3856cf;
    } catch (_0x498104) {
      console.log("Error: ", _0x498104);
    }
  }
}
async function _0x48e5d8(_0x251b2b) {
  const _0x48965d = await _0x10d33c(_0x251b2b);
  return _0x48965d ? (copyconfig()._0x50d099 ? (GM_setClipboard(_0x48965d), await notifyUser("Copied Key", _0x48965d, 60000, false, _0x48965d)) : (console.log("Already got key!"), await notifyUser("Got Key", _0x48965d, 60000, false, _0x48965d)), true) : false;
}
async function _0x4a629b(_0x3571fb) {
  const _0x320ed2 = extractPlatoTicket(_0x3571fb);
  if (await _0x48e5d8(_0x3571fb)) {
    return;
  }
  if (_0x320ed2) {
    const _0x5f1798 = await _0x9da910(_0x3571fb);
    const _0x34c964 = _0x5f1798._0x1aeb0b.service;
    const _0x465494 = new URL(_0x3571fb);
    const _0x4ee6d8 = _0x465494.hostname;
    const _0x41e20b = 'https://' + _0x4ee6d8 + '/api/session/step?ticket=' + _0x320ed2 + "&service=" + _0x34c964;
    try {
      const _0x42d681 = await fetch(_0x41e20b, {
        'method': "PUT",
        'headers': {
          '_0x1cf69d': "application/json"
        },
        'body': JSON.stringify({
          '_0x221349': null,
          '_0x4fda8b': "empty",
          '_0x283a31': 'empty'
        })
      });
      if (!_0x42d681.ok) {
        throw new Error("HTTP error! status: " + _0x42d681.status);
      }
      const _0x38136d = await _0x42d681.json();
      const _0x4d18c0 = _0x38136d.data.url;
      if (_0x4d18c0 === "about:blank") {
        if (await _0x48e5d8(window.location.href)) {
          return;
        } else {
          _0x4a629b(window.location.href);
          return;
        }
      }
      const _0x2f8313 = await bypassLink(_0x4d18c0);
      await notifyUser('Redirecting', "Moving to a new URL", 0x7d0);
      if (_0x2f8313 && _0x2f8313.result) {
        window.location.href = _0x2f8313.result;
        if (await _0x48e5d8(window.location.href)) {
          return;
        } else {
          _0x4a629b(window.location.href);
          return;
        }
      } else {
        console.error("Bypass failed or result is missing:", _0x2f8313);
        alert("Bypass failed. Check the console for details.");
      }
    } catch (_0x55dbf6) {
      console.error("Platoboost API or bypass error:", _0x55dbf6);
    }
  } else {
    console.log("Failed to get Platoboost Ticket");
  }
}
function _0x48c3f7(_0x193ecc) {
  function _0x1bd772(_0x418dd1) {
    if (typeof _0x418dd1 === "string") {
      return function (_0x30b511) {}.constructor("while (true) {}").apply("counter");
    } else if (('' + _0x418dd1 / _0x418dd1).length !== 0x1 || _0x418dd1 % 0x14 === 0x0) {
      (function () {
        return true;
      }).constructor("debugger").call("action");
    } else {
      (function () {
        return false;
      }).constructor("debugger").apply('stateObject');
    }
    _0x1bd772(++_0x418dd1);
  }
  try {
    if (_0x193ecc) {
      return _0x1bd772;
    } else {
      _0x1bd772(0x0);
    }
  } catch (_0x1b35d9) {}
}
