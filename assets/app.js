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
    // TODO display something in the DOM
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

  /* const display = (res) => {
      $(`#${mal}`).classList.add('added');
    } else return null;
  }; */

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

  const handle = (list) => {
    showProgress(list.length);
    // Base case for recursion
    if (list.length <= 0) return;

    const newList = list.slice(); // treat arguments as immutable
    const item = newList.shift();
    // add anime to results to be marked success/fail later
    listAnime(item);
    Mal.add(item)
    .then((res) => {
      // this is the response from MAL - not found/blank or Already in list or Created
      if (res) {
        if (res.message === 'Created' || res.message === 'Updated') {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(`${res.title}: ${res.message}`);
          if (res.message === 'Invalid ID') notFound(item.title);
        }
      } else {
        // Empty response from MAL means item not found
        markFail(item.id);
        malError(`${res.title}: ${res.message}`);
        notFound(item.title);
      }
      // Recursively call until list is empty
      handle(newList);
    })
    .catch(err => error(err));
  };

  return {
    sync: (event) => {
      event.preventDefault();
      const malUser = $('#mal-username').value.trim();
      const malPass = $('#mal-password').value.trim();
      $('#submit').classList.add('is-loading');
      Mal.check(malUser, malPass)
      .then((res) => {
        if (res) {
          const aniUser = $('#anilist-username').value.trim();
          Anilist.getList(aniUser)
          .then((lists) => { // This should be { anime[], manga[] } now
          /* So how should we take care of this?
            Should I write two update functions?
            The other thing I could do is just make one big list - there's already a type
            on each one
          */
            if (list && list.length) {
              // We have good inputs on all three counts; let's go
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
            Anilist.error(`Anilist.co returned no results for ${aniUser}.`);
            setTimeout(() => reset(), 3000);
            return error('Anilist.co returned no results.');
          })
          .catch(err => error(err));
        } else {
          // Mal auth check returned false
          Mal.error('Invaild MAL credentials.');
          setTimeout(() => reset(), 3000);
          return error('Invaild MAL credentials.');
        }
        return null;
      })
      .catch(err => error(err));
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
  Array.from($$('.modal-background')).forEach((e) => {
    e.on('click', () => $('.is-active').classList.remove('is-active'));
  });
  Array.from($$('.modal-close')).forEach((e) => {
    e.on('click', () => $('.is-active').classList.remove('is-active'));
  });
})();
