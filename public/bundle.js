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
/******/ 	return __webpack_require__(__webpack_require__.s = 73);
/******/ })
/************************************************************************/
/******/ ({

/***/ 70:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Anilist = function () {
  /*
    Anilist response takes the following form:
    data: {
      anime: {
        statusLists: {
          completed: [],
          planning: [],
          etc.
        },
        customLists: { etc. },
      },
      manga: {
        statusLists: { etc. },
        customLists: { etc. },
      }
    }
    'data' is stripped off by the fetch function, and flatten() is called once for
    anime and once for manga
     flatten() combines the statusLists and customLists, and all of the lists embedded in them,
    and creates one big flat array of items
  */
  var flatten = function flatten(obj) {
    return (
      // Outer reduce concats arrays built by inner reduce
      Object.keys(obj).reduce(function (accumulator, list) {
        return (
          // Inner reduce builds an array out of the lists
          accumulator.concat(Object.keys(obj[list]).reduce(function (acc2, item) {
            return acc2.concat(obj[list][item]);
          }, []))
        );
      }, [])
    );
  };

  // Remove duplicates from array
  var uniqify = function uniqify(arr) {
    var seen = new Set();
    return arr.filter(function (item) {
      return seen.has(item.media.idMal) ? false : seen.add(item.media.idMal);
    });
  };

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
    return anilistCall('\n      query ($userName: String) {\n        anime: MediaListCollection(userName: $userName, type: ANIME) {\n          statusLists {\n            status\n            score(format:POINT_10)\n            progress\n            startedAt {\n              year\n              month\n              day\n            }\n            completedAt {\n              year\n              month\n              day\n            }\n            repeat\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          },\n          customLists {\n            status\n            score(format:POINT_10)\n            progress\n            startedAt {\n              year\n              month\n              day\n            }\n            completedAt {\n              year\n              month\n              day\n            }\n            repeat\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          }\n        },\n        manga: MediaListCollection(userName: $userName, type: MANGA) {\n          statusLists {\n            status\n            score(format:POINT_10)\n            progress\n            progressVolumes\n            startedAt {\n              year\n              month\n              day\n            }\n            completedAt {\n              year\n              month\n              day\n            }\n            repeat\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          },\n          customLists {\n            status\n            score(format:POINT_10)\n            progress\n            progressVolumes\n            startedAt {\n              year\n              month\n              day\n            }\n            completedAt {\n              year\n              month\n              day\n            }\n            repeat\n            media {\n              idMal\n              title {\n                romaji\n              }\n            }\n          }\n        }\n      }\n    ', { userName: userName }).then(function (res) {
      return res.json();
    }).then(function (res) {
      return res.data;
    }).then(function (res) {
      return {
        anime: uniqify(flatten(res.anime)),
        manga: uniqify(flatten(res.manga))
      };
    });
  };

  var sanitize = function sanitize(item, type) {
    return {
      type: type,
      progress: item.progress,
      progressVolumes: item.progressVolumes,
      startedAt: {
        year: item.startedAt.year || 0,
        month: item.startedAt.month || 0,
        day: item.startedAt.day || 0
      },
      completedAt: {
        year: item.completedAt.year || 0,
        month: item.completedAt.month || 0,
        day: item.completedAt.day || 0
      },
      repeat: item.repeat,
      status: item.status,
      score: item.score,
      id: item.media.idMal,
      title: item.media.title.romaji
    };
  };

  return {
    getList: function getList(username) {
      return fetchList(username).then(function (lists) {
        return [].concat(_toConsumableArray(lists.anime.map(function (item) {
          return sanitize(item, 'anime');
        })), _toConsumableArray(lists.manga.map(function (item) {
          return sanitize(item, 'manga');
        })));
      }).catch(function (err) {
        console.error('Anilist getList error', err);
        return 'No data found for user ' + username;
      });
    }
  };
}();

module.exports = Anilist;

/***/ }),

/***/ 71:
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

/***/ 72:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* globals $ */
var statusCodes = ['', 'CURRENT', 'COMPLETED', 'PAUSED', 'DROPPED', '', 'PLANNING'];

var buildDate = function buildDate(dateString) {
  var parts = dateString.split('-');
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
    day: Number(parts[2])
  };
};

var sanitizeAnimeListing = function sanitizeAnimeListing(item) {
  return {
    type: 'anime',
    id: Number(item.series_animedb_id[0]),
    progress: Number(item.my_watched_episodes[0]),
    startedAt: buildDate(item.my_start_date[0]),
    completedAt: buildDate(item.my_finish_date[0]),
    status: statusCodes[item.my_status[0]],
    score: Number(item.my_score[0]),
    repeat: Number(item.my_rewatching[0])
  };
};

var sanitizeMangaListing = function sanitizeMangaListing(item) {
  return {
    type: 'manga',
    id: Number(item.series_mangadb_id[0]),
    progress: Number(item.my_read_chapters[0]),
    progressVolumes: Number(item.my_read_volumes[0]),
    startedAt: buildDate(item.my_start_date[0]),
    completedAt: buildDate(item.my_finish_date[0]),
    status: statusCodes[item.my_status[0]],
    score: Number(item.my_score[0]),
    repeat: Number(item.my_rereadingg[0]) // sic, spelling error is MAL's
  };
};

var getMalAppInfoList = function getMalAppInfoList(user, type) {
  return fetch('https://us-central1-douki-178418.cloudfunctions.net/malAppInfoProxy?user=' + user + '&type=' + type).then(function (res) {
    return res.json();
  }).then(function (res) {
    return res.result.myanimelist;
  }).then(function (list) {
    return list.anime || list.manga;
  });
};

var Mal = function () {
  var auth = '';

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

    getList: function getList(user) {
      var fetchAnimeList = getMalAppInfoList(user, 'anime');
      var fetchMangaList = getMalAppInfoList(user, 'manga');
      return Promise.all([fetchAnimeList, fetchMangaList]).then(function (lists) {
        var hashTable = {};
        lists[0].forEach(function (item) {
          var anime = sanitizeAnimeListing(item);
          hashTable[anime.id] = anime;
        });
        lists[1].forEach(function (item) {
          var manga = sanitizeMangaListing(item);
          hashTable[manga.id] = manga;
        });
        return hashTable;
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
        return res.text();
      })
      // Strip off leading and tailing double quotes
      .then(function (text) {
        return text.replace(/"/g, '');
      }).catch(function (err) {
        return Error(err);
      });
    }
  };
}();

module.exports = Mal;

/***/ }),

/***/ 73:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* eslint-disable no-unused-vars */
/* globals $, $$ */
__webpack_require__(71);
var Anilist = __webpack_require__(70);
var Mal = __webpack_require__(72);

var Ani2Sync = function () {
  var total = 0;
  var errors = 0;

  // For errors related to bad credentials, API errors etc.
  var error = function error(msg) {
    console.error(msg);
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

  // Returns true if item has changed and needs to be updated
  var changed = function changed(alItem, malItems) {
    var malItem = malItems[alItem.id];
    if (!malItem) {
      // Item does not exist yet, must update
      return true;
    }

    var matchFields = ['progress', 'status', 'score'];
    if (matchFields.some(function (field) {
      return malItem[field] !== alItem[field];
    })) return true;

    var dateMatchFields = ['year', 'month', 'day'];
    if (alItem.startedAt) {
      if (!malItem.startedAt) return true;
      if (dateMatchFields.some(function (field) {
        return alItem.startedAt[field] !== malItem.startedAt[field];
      })) return true;
    }

    if (alItem.completedAt) {
      if (!malItem.completedAt) return true;
      if (dateMatchFields.some(function (field) {
        return alItem.completedAt[field] !== malItem.completedAt[field];
      })) return true;
    }

    // Since this one can be undefined, it must be checked separately
    if (alItem.progressVolumes) {
      if (!malItem.progressVolumes) return true;
      if (malItem.progressVolumes !== alItem.progressVolumes) return true;
    }

    // No changes detected
    return false;
  };

  var handle = function handle(list) {
    showProgress(list.length);
    // Base case for recursion
    if (list.length <= 0) return;

    var newList = list.slice(); // treat arguments as immutable
    var item = newList.shift();
    // add anime to results to be marked success/fail later
    listAnime(item);
    Mal.add(item).then(function (message) {
      // this is the response from /mal/add - Created or Updated or an error
      if (message) {
        if (message === 'Created' || message === 'Updated') {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(item.title + ': ' + message);
          if (message === 'Invalid ID') notFound(item.title);
        }
      } else {
        // Empty response from MAL means item not found
        markFail(item.id);
        malError(item.title + ': ' + message);
        notFound(item.title);
      }
      // Recursively call until list is empty
      handle(newList);
    }).catch(function (err) {
      return error(err);
    });
  };

  var validateMalCredentials = function validateMalCredentials(malUser, malPass) {
    return Mal.check(malUser, malPass).then(function (res) {
      if (res) return Promise.resolve();
      // Mal auth check returned false
      $('.mal-error').innerHTML = 'Invaild MAL credentials.';
      setTimeout(function () {
        return reset();
      }, 3000);
      return Promise.reject();
    });
  };

  var getSyncList = function getSyncList(aniUser, malUser, syncType) {
    return Anilist.getList(aniUser).then(function (alList) {
      if (!alList || !alList.length) {
        $('.anilist-error').innerHTML = 'Anilist.co returned no results for ' + aniUser + '.';
        setTimeout(function () {
          return reset();
        }, 3000);
        return Promise.reject();
      }

      if (syncType === 'all') {
        return Promise.resolve(alList);
      }

      return Mal.getList(malUser).then(function (malItems) {
        return alList.filter(function (item) {
          return changed(item, malItems);
        });
      });
    });
  };

  return {
    sync: function sync(event) {
      event.preventDefault();
      var aniUser = $('#anilist-username').value.trim();
      var malUser = $('#mal-username').value.trim();
      var malPass = $('#mal-password').value.trim();
      var syncType = $('input[name="sync-type"]:checked').value;
      $('#submit').classList.add('is-loading');
      return validateMalCredentials(malUser, malPass).then(function () {
        getSyncList(aniUser, malUser, syncType).then(function (list) {
          // Clear old results
          reset();
          // Switch views
          $('#credentials').classList.add('hidden');
          $('#sync').classList.remove('hidden');
          // Track total items in namespace for progress meter
          total = list.length;
          // Start recursive handler
          return handle(list);
        });
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

/******/ });
//# sourceMappingURL=bundle.js.map