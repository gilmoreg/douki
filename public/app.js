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

  const malSearch = titles =>
    fetch('http://localhost:4000/mal/search', {
      method: 'post',
      body: JSON.stringify({ auth, titles }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL search err', err));

  const malUpdate = (id, xml) =>
    fetch('http://localhost:4000/mal/add/', {
      method: 'post',
      body: JSON.stringify({ auth, id, xml }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL add err', err));

  const getStatus = (status) => {
  // 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching'
  // status. 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
    switch (status.trim()) {
      case 'watching': return 1;
      case 'completed': return 2;
      case 'on-hold':
      case 'on hold':
      case 'onhold':
      case 'on_hold': return 3;
      case 'dropped': return 4;
      case 'plan to watch':
      case 'plan_to_watch':
      case 'plantowatch': return 6;
      default: {
        console.log(`unknown status "${status}"`);
        return '';
      }
    }
  };

  const makeXML = (a) => {
    const xml = `
      <?xml version="1.0" encoding="UTF-8"?>
      <entry>
        <episode>${a.episodes_watched || ''}</episode>
        <status>${getStatus(a.list_status)}</status>
        <score>${a.score || ''}</score>
        <storage_type></storage_type>
        <storage_value></storage_value>
        <times_rewatched></times_rewatched>
        <rewatch_value></rewatch_value>
        <date_start>${''}</date_start>
        <date_finish>${''}</date_finish>
        <priority>${a.priority || ''}</priority>
        <enable_discussion></enable_discussion>
        <enable_rewatching></enable_rewatching>
        <comments>${a.notes || ''}</comments>
        <tags></tags>
      </entry>
      `.trim().replace(/(\r\n|\n|\r)/gm, '');
    return encodeURIComponent(xml);
  };

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

  const add = (anilist, mal) =>
    new Promise((resolve) => {
      $('#results').append(`<li id="${mal}">Matched ${anilist.anime.title_romaji}</li>`);
      malUpdate(mal, makeXML(anilist))
      .then((res) => {
        if (res === 'Created' || res.match(/The anime \(id: \d+\) is already in the list./g)) {
          $(`#${mal}`).addClass('added');
          resolve();
        } else {
          $(`#${mal}`).addClass('error');
          fail(`Error: ${anilist.anime.title_romaji} - ${res}`);
          resolve();
        }
      });
    });

  const search = (list) => {
    if (list.length > 0) {
      $('#current').html(`${list.length - 1}`);
      const newList = list.slice();
      const item = newList.shift();
      malSearch([item.anime.title_romaji, item.anime.title_english, item.anime.title_japanese])
      .then((res) => {
        if (res && res.malID) {
          add(item, res.malID);
          search(newList);
        } else {
          fail(notFound(item));
          search(newList);
        }
      });
    }
  };

  return {
    sync: (list) => {
      $('#status').html(`Items remaining: <span id="current">${list.length}</span>. Errors: <span id="error-count">0</span>.`);
      search(list);
    },
    check: (user, pass) =>
      malCheck(user, pass)
      .then((res) => {
        if (res !== 'Invalid credentials') {
          auth = btoa(`${user}:${pass}`);
          return true;
        }
        $('#status').html('Invalid MAL credentials');
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
  const malUser = $('#mal-username').val().trim();
  const malPass = $('#mal-password').val().trim();
  Mal.check(malUser, malPass)
  .then((res) => {
    if (res) {
      const aniUser = $('#anilist-username').val().trim();
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
