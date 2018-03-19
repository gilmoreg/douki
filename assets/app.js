/* eslint-disable no-unused-vars */
/* globals $, $$ */
require('./bling.js');
const Anilist = require('./anilist');
const Mal = require('./mal');

const Ani2Sync = (() => {
  let total = 0;
  let errors = 0;

  // For errors related to bad credentials, API errors etc.
  const error = (msg) => {
    console.error(msg);
  };

  const reset = () => {
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

  const notFound = (title) => {
    $('#errors').innerHTML += `
      <li><a target="_blank" href="https://www.google.com/search?q=${encodeURIComponent(title)}+site%3Amyanimelist.net">
      Please try adding it manually</a>.</li>
    `;
  };

  // For errors reported by MAL (not found, not approved yet, etc.)
  const malError = (title) => {
    $('#errors').innerHTML += `<li>Could not match ${title}</li>`;
    errors += 1;
  };

  const listAnime = (a) => {
    $('#results').innerHTML += `<li id="al-${a.id}">${a.title}</li>`;
  };

  const markSuccess = (id) => {
    $(`#al-${id}`).classList.add('added');
  };

  const markFail = (id) => {
    $(`#al-${id}`).classList.add('error');
  };

  const showProgress = (count) => {
    $('.progress').setAttribute('value', (100 * (total - count)) / total);
    $('#status-message').innerHTML = `${count} items remaining.`;
    $('#error-count').innerHTML = `Errors: ${errors}.`;
  };

  // Returns true if item has changed and needs to be updated
  const changed = (alItem, malItems) => {
    const malItem = malItems[alItem.type][alItem.id];
    if (!malItem) {
      // Item does not exist yet, must update
      return true;
    }

    const matchFields = ['progress', 'status', 'score'];
    if (matchFields.some(field => malItem[field] !== alItem[field])) return true;

    const dateMatchFields = ['year', 'month', 'day'];
    if (alItem.startedAt) {
      if (!malItem.startedAt) return true;
      if (dateMatchFields.some(field =>
        alItem.startedAt[field] !== malItem.startedAt[field])) return true;
    }

    if (alItem.completedAt) {
      if (!malItem.completedAt) return true;
      if (dateMatchFields.some(field =>
        alItem.completedAt[field] !== malItem.completedAt[field])) return true;
    }

    // Since this one can be undefined, it must be checked separately
    if (alItem.progressVolumes) {
      if (!malItem.progressVolumes) return true;
      if (malItem.progressVolumes !== alItem.progressVolumes) return true;
    }

    // No changes detected
    return false;
  };

  const handle = (list) => {
    showProgress(list.length);
    // Base case for recursion
    if (list.length <= 0) return;

    const newList = list.slice(); // treat arguments as immutable
    const item = newList.shift();
    // add anime to results to be marked success/fail later
    listAnime(item);
    Mal.add(item)
    .then((message) => {
      // this is the response from /mal/add - Created or Updated or an error
      if (message) {
        if (message === 'Created' || message === 'Updated') {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(`${item.title}: ${message}`);
          if (message === 'Invalid ID') notFound(item.title);
        }
      } else {
        // Empty response from MAL means item not found
        markFail(item.id);
        malError(`${item.title}: ${message}`);
        notFound(item.title);
      }
      // Recursively call until list is empty
      handle(newList);
    })
    .catch(err => error(err));
  };

  const validateMalCredentials = (malUser, malPass) =>
    Mal.check(malUser, malPass)
      .then((res) => {
        if (res) return Promise.resolve();
        // Mal auth check returned false
        $('.mal-error').innerHTML = 'Invaild MAL credentials.';
        setTimeout(() => reset(), 3000);
        return Promise.reject();
      });

  const getSyncList = (aniUser, malUser, syncType) =>
    Anilist.getList(aniUser)
      .then((alList) => {
        if (!alList || !alList.length) {
          $('.anilist-error').innerHTML = `Anilist.co returned no results for ${aniUser}.`;
          setTimeout(() => reset(), 3000);
          return Promise.reject();
        }

        if (syncType === 'all') {
          return Promise.resolve(alList);
        }

        return Mal.getList(malUser)
          .then(malItems => alList.filter(item => changed(item, malItems)));
      });

  return {
    sync: (event) => {
      event.preventDefault();
      const aniUser = $('#anilist-username').value.trim();
      const malUser = $('#mal-username').value.trim();
      const malPass = $('#mal-password').value.trim();
      const syncType = $('input[name="sync-type"]:checked').value;
      $('#submit').classList.add('is-loading');
      return validateMalCredentials(malUser, malPass)
        .then(() => {
          getSyncList(aniUser, malUser, syncType)
            .then((list) => {
              if (!list) throw new Error('No items found');
              if (list.length === 0) {
                $('.anilist-error').innerHTML = 'No changes detected since your last sync.';
                setTimeout(() => reset(), 3000);
                return null;
              }
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
        })
        .catch((err) => {
          $('.anilist-error').innerHTML = err.message;
          setTimeout(() => reset(), 3000);
          return null;
        });
    },
    restart: () => {
      reset();
    },
  };
})();

(() => {
  $('#credentials').on('submit', Ani2Sync.sync);
  $('#reset').on('click', Ani2Sync.restart);
  $('#help').on('click', () => {
    $('#helpModal').classList.add('is-active');
  });
  $('#sync-help').on('click', () => {
    $('#syncTypeModal').classList.add('is-active');
  });
  Array.from($$('.modal-background')).forEach((e) => {
    e.on('click', () => $('.is-active').classList.remove('is-active'));
  });
  Array.from($$('.modal-close')).forEach((e) => {
    e.on('click', () => $('.is-active').classList.remove('is-active'));
  });
})();
