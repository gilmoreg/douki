/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const requests = [];

setInterval(() => {
  if (requests.length > 0) {
    const request = requests.pop();
    if (typeof request === 'function') {
      request();
    }
  }
}, 250);

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
        .catch(err => console.log('Anilist err', err)),
  };
})();

const Mal = (() => {
  const search = (username, password, title) =>
    fetch(`http://localhost:4000/mal/search/${title}`, {
      method: 'post',
      body: JSON.stringify({ username, password }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(res => res.json())
    .catch(err => console.log('MAL err', err));

  const match = (anilist, mal) => {
    const aniYear = anilist.anime.start_date_fuzzy.toString().substring(0, 4);
    for (let i = 0; i < mal.entry.length; i += 1) {
      const malYear = mal.entry[i].start_date[0].substring(0, 4);
      // Since titles can be similar, matching years can help with false positives
      if (aniYear === malYear) {
        return mal.entry[i];
      }
    }
    return null;
  };

  const getStatus = (status) => {
  // 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching'
  // status. 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
    switch (status) {
      case 'watching': return 1;
      case 'completed': return 2;
      case 'on_hold': return 3;
      case 'dropped': return 4;
      case 'plan_to_watch': return 6;
      default: return '';
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

  return {
    sync: (user, pass, list) => {
      const failures = [];
      // list.forEach((item) => {
      item = list[0];
      search(user, pass, item.anime.title_romaji)
      .then((res) => {
        const m = match(item, res.anime);
        if (m) {
          console.log('match', makeXML(m));
        } else {
          console.log('no match');
          failures.push({
            aniTitle: item.anime.title_romaji,
            aniId: item.record_id,
            malTitles: res.anime.entry.map(item => item.title),
            malIDs: es.anime.entry.map(item => item.id),
          });
        }
      });
    },
  };
})();

const sync = (event) => {
  event.preventDefault();
  const malUser = $('#mal-username').val().trim();
  const malPass = $('#mal-password').val().trim();
  Anilist.getList($('#anilist-username').val().trim())
  .then(list => Mal.sync(malUser, malPass, list));
};


(() => {
  $('#credentials').on('submit', sync);
})();
