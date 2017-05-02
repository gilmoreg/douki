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
      ...res.lists.completed,
      ...res.lists.plan_to_watch,
      ...res.lists.dropped,
      ...res.lists.on_hold,
      ...res.lists.watching,
    ];

  return {
    getList: username =>
      fetchToken()
        .then(token => fetchList(username, token))
        .then(res => buildList(res))
        .catch(err => $('#status').append(`<li>Unable to fetch Anilist.co list: ${err}</li>`)),
  };
})();

const Mal = (() => {
  let username = '';
  let password = '';
  let errors = 0;

  const malCheck = (user, pass) =>
    fetch('http://localhost:4000/mal/check', {
      method: 'post',
      body: JSON.stringify({ username: user, password: pass }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL check err', err));

  const malSearch = title =>
    fetch(`http://localhost:4000/mal/search/${encodeURIComponent(title)}`, {
      method: 'post',
      body: JSON.stringify({ username, password }),
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
      body: JSON.stringify({ username, password, id, xml }),
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
    `${a.anime.title_romaji}. <a target="_blank" href="https://www.google.com/search?q=${encodeURIComponent(a.anime.title_romaji)}+site%3Amyanimelist.net">Please try adding it manually</a>. Status: ${a.list_status}. Score: ${a.score}, Eps Watched: ${a.episodes_watched}.`;

  const fail = (title) => {
    $('#errors').append(`<li>Could not match ${title}</li>`);
    errors += 1;
    $('#error-count').html(`${errors}`);
  };

  const add = (anilist, mal) => {
    $('#results').append(`<li id="${mal}">Matched ${anilist.anime.title_romaji}</li>`);
    malUpdate(mal, makeXML(anilist))
      .then((res) => {
        if (res === 'Created' || res.match(/The anime \(id: \d+\) is already in the list./g)) {
          $(`#${mal}`).addClass('added');
        } else {
          $(`#${mal}`).addClass('error');
          fail(`Error: ${anilist.anime.title_romaji} - ${res}`);
        }
      });
  };

  const findMatch = (anilist, mal) => {
    try {
      const aniDate = anilist.anime.start_date_fuzzy || anilist.anime.start_date;
      const aniYear = aniDate ? aniDate.toString().substring(0, 4) : null;
      for (let i = 0; i < mal.entry.length; i += 1) {
        const malYear = mal.entry[i].start_date[0].substring(0, 4);
        // Since titles can be similar, matching years can help with false positives
        if (!aniYear || (aniYear === malYear)) {
          return add(anilist, mal.entry[i].id);
        }
      }
    } catch (err) {
      console.log(
        'findMatch error',
        anilist ? JSON.stringify(anilist) : null,
        mal ? JSON.stringify(mal) : null,
        err);
      return err;
    }
    // No match found
    fail(notFound(anilist));
    return null;
  };

  const search = (list) => {
    if (list.length > 0) {
      $('#current').html(`${list.length - 1}`);
      const newList = list.slice();
      const item = newList.shift();
      malSearch(item.anime.title_romaji)
      .then((res) => {
        if (res) {
          findMatch(item, res.anime);
          search(newList);
        } else {
          // Romaji title didn't match, try english
          malSearch(item.anime.title_english)
          .then((resE) => {
            if (resE) {
              findMatch(item, resE.anime);
              search(newList);
            } else {
              fail(notFound(item));
              search(newList);
            }
          });
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
          username = user;
          password = pass;
          return true;
        }
        $('#status').html('Invalid MAL credentials');
        return false;
      }),
  };
})();

const sync = (event) => {
  event.preventDefault();
  const malUser = $('#mal-username').val().trim();
  const malPass = $('#mal-password').val().trim();
  Mal.check(malUser, malPass)
  .then((res) => {
    if (res) {
      Anilist.getList($('#anilist-username').val().trim())
      .then((list) => {
        if (list) Mal.sync(list);
      });
    }
  });
};


(() => {
  $('#credentials').on('submit', sync);
})();
