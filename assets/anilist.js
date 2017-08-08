/* globals $ */
// const ANILIST_TOKEN_URL = 'https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token';

const Anilist = (() => {
  const anilistCall = (query, variables) =>
    fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

  const getUserId = name =>
    anilistCall(`
      query ($name: String) {
        User (name: $name) {
          id
        }
      }
    `, { name })
    .then(res => res.json())
    .then(res => res.data.User.id)
    .catch(err => Error(err));

  const fetchList = userId =>
    anilistCall(`
      query ($userId: Int, $type: MediaType) {
        MediaListCollection(userId: $userId, type: $type) {
          statusLists {
            status
            score
            progress
            media {
              idMal
              title {
                romaji
              }
            }
          }
        }
      }
    `, { userId, type: 'ANIME' })
    .then(res => res.json())
    .then(res => res.data.MediaListCollection.statusLists)
    .catch(err => Error(err));

  const buildList = (res) => {
    if (!res) return [];
    return [
      ...res.completed || [],
      ...res.current || [],
      ...res.dropped || [],
      ...res.paused || [],
      ...res.planning || [],
    ];
  };

  const sanitize = item => ({
    progress: item.progress,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji,
  });

  const error = (msg) => {
    $('.anilist-error').innerHTML = msg;
  };

  return {
    getList: username =>
      getUserId(username)
        .then(userId => fetchList(userId))
        .then(res => buildList(res))
        .then(res => res.map(item => sanitize(item)))
        .catch(err => Error(err)),
    error: msg => error(msg),
  };
})();

module.exports = Anilist;
