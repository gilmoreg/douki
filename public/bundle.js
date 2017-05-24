/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  ANILIST_TOKEN_URL: 'https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token',
  ENDPOINT: 'http://localhost:4000'
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var config = __webpack_require__(0);

var Anilist = function () {
  var fetchToken = function fetchToken() {
    return fetch(config.ANILIST_TOKEN_URL).then(function (res) {
      return res.json();
    }).then(function (res) {
      return JSON.parse(res).access_token;
    }).catch(function (err) {
      return Error(err);
    });
  };

  var fetchList = function fetchList(username, token) {
    return fetch('https://anilist.co/api/user/' + username + '/animelist?access_token=' + token).then(function (res) {
      return res.json();
    }).catch(function (err) {
      return Error(err);
    });
  };

  var buildList = function buildList(res) {
    // console.log(Object.keys(res.lists));
    // [ 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching' ]
    if (!res.lists) return [];
    return [].concat(_toConsumableArray(res.lists.completed || []), _toConsumableArray(res.lists.plan_to_watch || []), _toConsumableArray(res.lists.dropped || []), _toConsumableArray(res.lists.on_hold || []), _toConsumableArray(res.lists.watching || []));
  };

  var sanitize = function sanitize(item) {
    return {
      episodes_watched: item.episodes_watched,
      list_status: item.list_status,
      score: item.score,
      priority: item.priority,
      notes: item.notes,
      title: item.anime.title_romaji,
      id: item.series_id
    };
  };

  return {
    getList: function getList(username) {
      return fetchToken().then(function (token) {
        return fetchList(username, token);
      }).then(function (res) {
        return buildList(res);
      }).then(function (res) {
        return res.map(function (item) {
          return sanitize(item);
        });
      }).catch(function (err) {
        return Error(err);
      });
    }
  };
}();

module.exports = Anilist;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* bling.js */

// Modified to make $ querySelector and $$ qSA
window.$ = document.querySelector.bind(document);
window.$$ = document.querySelectorAll.bind(document);
Node.prototype.on = window.on = function (name, fn) {
  this.addEventListener(name, fn);
};
NodeList.prototype.__proto__ = Array.prototype;
NodeList.prototype.on = NodeList.prototype.addEventListener = function (name, fn) {
  this.forEach(function (elem, i) {
    elem.on(name, fn);
  });
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var config = __webpack_require__(0);

var Mal = function () {
  var auth = '';

  return {
    check: function check(user, pass) {
      return fetch(config.ENDPOINT + '/mal/check', {
        method: 'post',
        body: JSON.stringify({ auth: btoa(user + ':' + pass) }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function (res) {
        if (res !== 'Invalid credentials') {
          auth = btoa(user + ':' + pass);
          return true;
        }
        return false;
      }).catch(function (err) {
        return Error(err);
      });
    },

    add: function add(anilist) {
      return fetch(config.ENDPOINT + '/mal/add', {
        method: 'post',
        body: JSON.stringify({ auth: auth, anilist: anilist }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(function (res) {
        return res.json();
      }).catch(function (err) {
        return Error(err);
      });
    }
  };
}();

module.exports = Mal;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable no-unused-vars */
/* globals $, $$ */
__webpack_require__(2);
var Anilist = __webpack_require__(1);
var Mal = __webpack_require__(3);

var Ani2Sync = function () {
  var total = 0;
  var errors = 0;

  // For errors related to bad credentials, API errors etc.
  var error = function error(msg) {
    console.error(msg);
    // TODO display something in the DOM
  };

  var reset = function reset() {
    $('#credentials').classList.toggle('hidden');
    $('#sync').classList.toggle('hidden');
    $('#error-count').innerHTML = '';
    $('#results').innerHTML = '';
    $('#submit').classList.remove('is-loading');
    total = 0;
    errors = 0;
  };

  var notFound = function notFound(a) {
    $('#errors').innerHTML += '\n      <li><a target="_blank" href="https://www.google.com/search?q=' + encodeURIComponent(a.title) + '+site%3Amyanimelist.net">\n      Please try adding it manually</a>.</li>\n    ';
  };

  // For errors reported by MAL (not found, not approved yet, etc.)
  var malError = function malError(title) {
    $('#errors').innerHTML += '<li>Could not match ' + title + '</li>';
    errors += 1;
  };

  /* const display = (res) => {
      $(`#${mal}`).classList.add('added');
    } else return null;
  }; */

  var listAnime = function listAnime(a) {
    $('#results').innerHTML += '<li id="al-' + a.id + '">' + a.title + '</li>';
  };

  var markSuccess = function markSuccess(id) {
    $('#al-' + id).classList.add('added');
  };

  var markFail = function markFail(id) {
    $('#al-' + id).classList.add('error');
  };

  var showProgress = function showProgress(count) {
    $('#progress').style.width = 100 * (total - count) / total + '%';
    $('#status-message').innerHTML = count + ' items remaining.';
    $('#error-count').innerHTML = 'Errors: ' + errors + '.';
  };

  var handle = function handle(list) {
    showProgress(list.length);
    // Base case for recursion
    if (list.length <= 0) return;

    var newList = list.slice(); // treat arguments as immutable
    var item = newList.shift();
    // add anime to results to be marked success/fail later
    listAnime(item);

    Mal.add(item).then(function (res) {
      console.log('Mal.add res', res);
      // this is the response from MAL - not found/blank or Already in list or Created
      if (res) {
        if (res.message === 'Created' || res.message.match(/The anime \(id: \d+\) is already in the list./g)) {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(res.title);
          if (res.message === 'Invalid ID') notFound(item);
        }
      } else {
        // Empty response from MAL means item not found
        notFound(item);
      }
      // Recursively call until list is empty
      handle(newList);
    }).catch(function (err) {
      return error(err);
    });
  };

  return {
    sync: function sync(event) {
      event.preventDefault();
      var malUser = $('#mal-username').value.trim();
      var malPass = $('#mal-password').value.trim();
      $('#submit').classList.add('is-loading');
      Mal.check(malUser, malPass).then(function (res) {
        if (res) {
          var aniUser = $('#anilist-username').value.trim();
          Anilist.getList(aniUser).then(function (list) {
            if (list) {
              // We have good inputs on all three counts; let's go
              // Clear old results and switch views
              reset();
              // Track total items in namespace for progress meter
              total = list.length;
              // Start recursive handler
              return handle(list);
            }
            return error('Anilist.co returned no results.');
          }).catch(function (err) {
            return error(err);
          });
        }
      }).catch(function (err) {
        return error(err);
      });
    },
    restart: function restart() {
      reset();
    }
  };
}();

(function () {
  $('#credentials').on('submit', Ani2Sync.sync);
  $('#reset').on('click', Ani2Sync.restart);
})();

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map