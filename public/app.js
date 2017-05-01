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
        .catch(err => console.log('Anilist err', err)),
  };
})();

const Mal = (() => {
  let credentials = {
    username: '',
    password: '',
  };

  const search = title =>
    fetch('localhost:4000/mal/search')
    .then((res) => {
      
    })
    .catch(err => console.log('MAL err', err));

  const match = (anilist, mal) => {
    const aniYear = anilist.start_date_fuzzy.toString().substring(0, 4);
    const entries = mal.anime.entry;
    for (let i = 0; i < entries.length; i += 1) {
      const malYear = entries[i].start_date[0].substring(0, 4);
      // Since titles can be similar, matching years can help with false positives
      if (aniYear === malYear) {
        return entries[i];
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

  const makeXml = (a) => {
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
    setCredentials: (creds) => {
      credentials = creds;
    },
    getCredentials: () => credentials,
  };
})();

const sync = (event) => {
  event.preventDefault();
  Mal.setCredentials($('#mal-username').val().trim(), $('#mal-password').val().trim());
  Anilist.getList($('#anilist-username').val().trim())
  .then(list => Mal.sync(list));
};


(() => {
  $('#credentials').on('submit', sync);
})();
