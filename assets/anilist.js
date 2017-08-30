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

  const fetchList = userName =>
    anilistCall(`
      query ($userName: String) {
        anime: MediaListCollection(userName: $userName, type: ANIME) {
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
        manga: MediaListCollection(userName: $userName, type: MANGA) {
          statusLists {
            status
            score(format:POINT_10)
            progress
            progressVolumes
            media {
              idMal
              title {
                romaji
              }
            }
          }
        }
      }
    `, { userName })
    .then(res => res.json())
    .then(res => ({
      anime: res.data.anime.statusLists,
      manga: res.data.manga.statusLists,
    }));

  const buildLists = (res) => {
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

  return {
    getList: username =>
      fetchList(username)
        .then(res => buildLists(res))
        .then(lists => [
          ...lists.anime.map(item => sanitize(item, 'anime')),
          ...lists.manga.map(item => sanitize(item, 'manga')),
        ])
        .catch(err => Error(err)),
  };
})();

module.exports = Anilist;
