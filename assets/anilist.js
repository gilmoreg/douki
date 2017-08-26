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
      query {
        anime: MediaListCollection(userId: $userId, type: ANIME) {
          statusLists {
            status
            score(format:POINT_10)
            progress
            media {
              idMal
              title {
                romaji
              }
            }
          }
        },
        manga: MediaListCollection(userId: $userId, type: MANGA) {
          statusLists {
            status
            score(format:POINT_10)
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
    `, { userId })
    .then(res => res.json())
    .then(res => ({
      anime: res.data.anime.MediaListCollection.statusLists,
      manga: res.data.manga.MediaListCollection.statusLists,
    }))
    .catch(err => Error(err));

  const buildList = (res) => {
    if (!res) return { anime: [], manga: [] };
    const { anime, manga } = res;
    return {
      anime: [
        ...anime.completed || [],
        ...anime.current || [],
        ...anime.dropped || [],
        ...anime.paused || [],
        ...anime.planning || [],
      ],
      manga: [
        ...manga.completed || [],
        ...manga.current || [],
        ...manga.dropped || [],
        ...manga.paused || [],
        ...manga.planning || [],
      ],
    };
  };

  const sanitize = (item, type) => ({
    type,
    progress: item.progress,
    volumes: item.progressVolumes,
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
        .then(res => ({
          anime: res.map(item => sanitize(item, 'anime')),
          manga: res.map(item => sanitize(item, 'manga')),
        }))
        .catch(err => Error(err)),
    error: msg => error(msg),
  };
})();

module.exports = Anilist;
