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

  const notFound = (a) => {
    $('#errors').innerHTML += `
      <li><a target="_blank" href="https://www.google.com/search?q=${encodeURIComponent(a.title)}+site%3Amyanimelist.net">
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
    // TODO progress bar
    console.log(`Progress: ${count}/${total} ${Math.floor(count / total)}`);
    $('#current').innerHTML = `${count - 1}`;
    $('#error-count').innerHTML = `${errors}`;
  };

  const add = (list) => {
    showProgress(list.length);
    // Base case for recursion
    if (list.length <= 0) return;

    const newList = list.slice();
    const item = newList.shift();
    // add anime to results to be marked success/fail later
    console.log('item', item);
    listAnime(item);

    Mal.add(item)
    .then((res) => {
      console.log('Mal.add', res);
      // this is the response from MAL - not found/blank or Alreday in list or Created
      if (res) {
        if (res.message === 'Created' || res.message.match(/The anime \(id: \d+\) is already in the list./g)) {
          markSuccess(item.id);
        } else {
          markFail(item.id);
          malError(res);
        }
      } else {
        // Empty response from MAL means item not found
        notFound(item);
      }

      // Recursively call until list is empty
      add(newList);
    })
    .catch(err => error(err));
  };

  return {
    sync: (event) => {
      // TODO clear old searches/results
      event.preventDefault();
      const malUser = $('#mal-username').value.trim();
      const malPass = $('#mal-password').value.trim();
      Mal.check(malUser, malPass)
      .then((res) => {
        if (res) {
          const aniUser = $('#anilist-username').value.trim();
          Anilist.getList(aniUser)
          .then((list) => {
            if (list) {
              total = list.length;
              return add(list);
            }
            return error('Anilist.co returned no results.');
          })
          .catch(err => error(err));
        }
      })
      .catch(err => error(err));
    },
  };
})();

(() => {
  $('#credentials').on('submit', Ani2Sync.sync);
})();
