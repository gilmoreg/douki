/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const Anilist = (() => {
  const fetchToken = () =>
    fetch('https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token')
      .then(res => res.json())
      .then(res => JSON.parse(res).access_token)
      .catch(err => console.log('err', err));

  const fetchList = (username, token) =>
    fetch(`https://anilist.co/api/user/${username}/animelist?access_token=${token}`)
      .then(res => res.json())
      .catch(err => console.log('err', err));

  const buildList = res =>
    // console.log(Object.keys(res.lists));
    // [ 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching' ]
    [
      ...res.lists.completed || [],
      ...res.lists.plan_to_watch || [],
      ...res.lists.dropped || [],
      ...res.lists.on_hold || [],
      ...res.lists.watching || [],
    ];

  return {
    getList: username =>
      fetchToken()
        .then(token => fetchList(username, token))
        .then(res => buildList(res))
        .catch((err) => {
          $('#status').append(`<li>Unable to fetch Anilist.co list: ${err}</li>`);
          console.log(err);
          return err;
        }),
  };
})();

const Mal = (() => {
  let auth = '';
  let errors = 0;

  const malCheck = (user, pass) =>
    fetch('http://localhost:4000/mal/check', {
      method: 'post',
      body: JSON.stringify({ auth: btoa(`${user}:${pass}`) }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL check err', err));

  const malSearch = (titles, anilist) =>
    fetch('http://localhost:4000/mal/add', {
      method: 'post',
      body: JSON.stringify({ auth, anilist }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL search err', err));

  const notFound = a =>
    `${a.anime.title_romaji}.
    <a target="_blank" href="https://www.google.com/search?q=${encodeURIComponent(a.anime.title_romaji)}+site%3Amyanimelist.net">
    Please find the MAL ID</a> and enter it here:
    <label for="malID-${a.anime.id}">MAL ID</label>
    <input type="text" id="malID-${a.anime.id}" name="malID">
    <input type="hidden" name="aniTitle" value="${a.anime.title_romaji}">
    `;

  const fail = (title) => {
    $('#errors').append(`<li>Could not match ${title}</li>`);
    errors += 1;
    $('#error-count').html(`${errors}`);
  };

  const display = (res) => {
    console.log('display', res);
  };
    /* $('#results').append(`<li id="${mal}">Matched ${anilist.anime.title_romaji}</li>`);
      .then((res) => {
        if (res === 'Created' || res.match(/The anime \(id: \d+\) is already in the list./g)) {
          $(`#${mal}`).addClass('added');
          resolve();
        } else {
          $(`#${mal}`).addClass('error');
          fail(`Error: ${anilist.anime.title_romaji} - ${res}`);
          resolve();
        }
      });*/

  const search = (list) => {
    if (list.length > 0) {
      $('#current').html(`${list.length - 1}`);
      const newList = list.slice();
      const item = newList.shift();
      malSearch(auth, item)
      .then((res) => {
        display(res);
        search(newList);
        /* if (res && res.malID) {
          add(item, res.malID);
          search(newList);
        } else {
          fail(notFound(item));
          search(newList);
        } */
      });
    }
  };

  return {
    sync: (list) => {
      $('#status').innerHTML = `Items remaining: <span id="current">${list.length}</span>. Errors: <span id="error-count">0</span>.`;
      search(list);
    },
    check: (user, pass) =>
      malCheck(user, pass)
      .then((res) => {
        if (res !== 'Invalid credentials') {
          auth = btoa(`${user}:${pass}`);
          return true;
        }
        $('#status').innerHTML = 'Invalid MAL credentials';
        return false;
      }),
  };
})();

const addMatch = (e) => {
  e.preventDefault();
  // TODO sanitize this stuff
  const aniTitle = $('').val().trim();
  const malID = $('').val().trim();   // convert to Int
  fetch('http://localhost:4000/mal/check', {
    method: 'post',
    body: JSON.stringify({ aniTitle, malID }),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then(res => res.json())
  .catch(err => console.log('Add match error', err));
};

const sync = (event) => {
  event.preventDefault();
  const malUser = $('#mal-username').value.trim();
  const malPass = $('#mal-password').value.trim();
  Mal.check(malUser, malPass)
  .then((res) => {
    if (res) {
      const aniUser = $('#anilist-username').value.trim();
      Anilist.getList(aniUser)
      .then((list) => {
        console.log('Mal list', list);
        if (list) Mal.sync(list);
      })
      .catch(err => console.log('err', err));
    }
  })
  .catch(err => console.log('err', err));
};


(() => {
  $('#credentials').on('submit', sync);
})();
