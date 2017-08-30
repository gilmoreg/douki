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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/* globals $ */
// const ANILIST_TOKEN_URL = 'https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token';

var Anilist = function () {
  var anilistCall = function anilistCall(query, variables) {
    return fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        query: query,
        variables: variables
      })
    });
  };

  var fetchList = function fetchList(userName) {
    return anilistCall('\n      query ($userName: String) {\n        anime: MediaListCollection(userName: $userName, type: ANIME) {\n          statusLists {\n            status\n            score(format:POINT_10)\n            progress\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          }\n        },\n        manga: MediaListCollection(userName: $userName, type: MANGA) {\n          statusLists {\n            status\n            score(format:POINT_10)\n            progress\n            progressVolumes\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          }\n        }\n      }\n    ', { userName: userName }).then(function (res) {
      return res.json();
    }).then(function (res) {
      return {
        anime: res.data.anime.statusLists,
        manga: res.data.manga.statusLists
      };
    }).catch(function (err) {
      return Error(err);
    });
  };

  var buildLists = function buildLists(res) {
    if (!res) return { anime: [], manga: [] };
    var anime = res.anime,
        manga = res.manga;

    return {
      anime: [].concat(_toConsumableArray(anime.completed || []), _toConsumableArray(anime.current || []), _toConsumableArray(anime.dropped || []), _toConsumableArray(anime.paused || []), _toConsumableArray(anime.planning || [])),
      manga: [].concat(_toConsumableArray(manga.completed || []), _toConsumableArray(manga.current || []), _toConsumableArray(manga.dropped || []), _toConsumableArray(manga.paused || []), _toConsumableArray(manga.planning || []))
    };
  };

  var sanitize = function sanitize(item, type) {
    return {
      type: type,
      progress: item.progress,
      volumes: item.progressVolumes,
      status: item.status,
      score: item.score,
      id: item.media.idMal,
      title: item.media.title.romaji
    };
  };

  var _error = function _error(msg) {
    $('.anilist-error').innerHTML = msg;
  };

  return {
    getList: function getList(username) {
      return fetchList(username).then(function (res) {
        return buildLists(res);
      }).then(function (lists) {
        return [].concat(_toConsumableArray(lists.anime.map(function (item) {
          return sanitize(item, 'anime');
        })), _toConsumableArray(lists.manga.map(function (item) {
          return sanitize(item, 'manga');
        })));
      }).catch(function (err) {
        return Error(err);
      });
    },
    error: function error(msg) {
      return _error(msg);
    }
  };
}();

module.exports = Anilist;

/***/ }),
/* 1 */
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
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* globals $ */
var Mal = function () {
  var auth = '';

  var _error = function _error(msg) {
    $('.mal-error').innerHTML = msg;
  };

  return {
    check: function check(user, pass) {
      var authCheck = btoa(user + ':' + pass);
      var url = 'https://us-central1-douki-178418.cloudfunctions.net/mal-proxy/check?auth=' + authCheck;
      return fetch(url).then(function (res) {
        return res.json();
      }).then(function (res) {
        if (res.success && res.success.includes('username')) {
          auth = authCheck;
          return true;
        }
        return false;
      }).catch(function (err) {
        return Error(err);
      });
    },

    add: function add(anilist) {
      return fetch('/mal/add', {
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
    },
    error: function error(msg) {
      return _error(msg);
    }
  };
}();

module.exports = Mal;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable no-unused-vars */
/* globals $, $$ */
__webpack_require__(1);
var Anilist = __webpack_require__(0);
var Mal = __webpack_require__(2);

var Ani2Sync = function () {
  var total = 0;
  var errors = 0;

  // For errors related to bad credentials, API errors etc.
  var error = function error(msg) {
    console.error(msg);
    // TODO display something in the DOM
  };

  var reset = function reset() {
    $('#credentials').classList.remove('hidden');
    $('#sync').classList.add('hidden');
    $('#error-count').innerHTML = '';
    $('#errors').innerHTML = '';
    $('#results').innerHTML = '';
    $('.anilist-error').innerHTML = '';
    $('.mal-error').innerHTML = '';
    $('#submit').classList.remove('is-loading');
    total = 0;
    errors = 0;
  };

  var notFound = function notFound(title) {
    $('#errors').innerHTML += '\n      <li><a target="_blank" href="https://www.google.com/search?q=' + encodeURIComponent(title) + '+site%3Amyanimelist.net">\n      Please try adding it manually</a>.</li>\n    ';
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
    $('.progress').setAttribute('value', 100 * (total - count) / total);
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
      // this is the response from MAL - not found/blank or Already in list or Created
      if (res) {
        if (res.message === 'Created' || res.message === 'Updated') {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(res.title + ': ' + res.message);
          if (res.message === 'Invalid ID') notFound(item.title);
        }
      } else {
        // Empty response from MAL means item not found
        markFail(item.id);
        malError(res.title + ': ' + res.message);
        notFound(item.title);
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
            console.log('lists', list);
            if (list && list.length) {
              // We have good inputs on all counts; let's go
              // Clear old results
              reset();
              // Switch views
              $('#credentials').classList.add('hidden');
              $('#sync').classList.remove('hidden');
              // Track total items in namespace for progress meter
              total = list.length;
              // Start recursive handler
              return handle(list);
            }
            // Anilist returned nothing
            Anilist.error('Anilist.co returned no results for ' + aniUser + '.');
            setTimeout(function () {
              return reset();
            }, 3000);
            return error('Anilist.co returned no results.');
          }).catch(function (err) {
            return error(err);
          });
        } else {
          // Mal auth check returned false
          Mal.error('Invaild MAL credentials.');
          setTimeout(function () {
            return reset();
          }, 3000);
          return error('Invaild MAL credentials.');
        }
        return null;
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
  $('#help').on('click', function () {
    $('#helpModal').classList.add('is-active');
  });
  Array.from($$('.modal-background')).forEach(function (e) {
    e.on('click', function () {
      return $('.is-active').classList.remove('is-active');
    });
  });
  Array.from($$('.modal-close')).forEach(function (e) {
    e.on('click', function () {
      return $('.is-active').classList.remove('is-active');
    });
  });
})();

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map