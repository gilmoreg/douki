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
        .catch(err => console.log('err', err)),
  };
})();

const Mal = (() => {
  let username = '';
  let password = '';

  const malSearch = title =>
  new Promise((resolve, reject) => {
    const uriTitle = encodeURIComponent(title);
    const auth = btoa(`${process.env.MAL_USER}:${process.env.MAL_PW}`);
    fetch(`https://myanimelist.net/api/anime/search.xml?q=${uriTitle}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then((res) => {
      parser.parseString(res, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    })
    .catch(err => reject(err));
  });

  const malUpdate = (id, xml) =>
  new Promise((resolve, reject) => {
    const auth = btoa(`${username}:${password}`);
    fetch(`https://myanimelist.net/api/animelist/add/${id}.xml?data=${xml}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

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
    setCredentials: (user, pass) => {
      username = user;
      password = pass;
    },
    sync: (list) => {

    },
  };
})();

const sync = (event) => {
  event.preventDefault();
  Mal.setCredentials($('#mal-username').val().trim(), $('#mal-password').val().trim());
  Anilist.getList($('#anilist-username').val().trim())
  .then((list) => {
    console.log(list[0]);
  });
};


(() => {
  $('#credentials').on('submit', sync);
})();
