const config = require('./config');

const Anilist = (() => {
  const fetchToken = () =>
    fetch(config.ANILIST_TOKEN_URL)
      .then(res => res.json())
      .then(res => JSON.parse(res).access_token)
      .catch(err => Error(err));

  const fetchList = (username, token) =>
    fetch(`https://anilist.co/api/user/${username}/animelist?access_token=${token}`)
      .then(res => res.json())
      .catch(err => Error(err));

  const buildList = (res) => {
    // console.log(Object.keys(res.lists));
    // [ 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching' ]
    if (!res.lists) return [];
    return [
      ...res.lists.completed || [],
      ...res.lists.plan_to_watch || [],
      ...res.lists.dropped || [],
      ...res.lists.on_hold || [],
      ...res.lists.watching || [],
    ];
  };

  const sanitize = item => ({
    episodes_watched: item.episodes_watched,
    list_status: item.list_status,
    score: item.score,
    priority: item.priority,
    notes: item.notes,
    title: item.anime.title_romaji,
    id: item.series_id,
  });

  return {
    getList: username =>
      fetchToken()
        .then(token => fetchList(username, token))
        .then(res => buildList(res))
        .then(res => res.map(item => sanitize(item)))
        .catch(err => Error(err)),
  };
})();

module.exports = Anilist;
