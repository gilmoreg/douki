const Anilist = (() => {
  /*
    Anilist response takes the following form:
    data: {
      anime: {
        statusLists: {
          completed: [],
          planning: [],
          etc.
        },
        customLists: { etc. },
      },
      manga: {
        statusLists: { etc. },
        customLists: { etc. },
      }
    }
    'data' is stripped off by the fetch function, and flatten() is called once for
    anime and once for manga

    flatten() combines the statusLists and customLists, and all of the lists embedded in them,
    and creates one big flat array of items
  */
  const flatten = obj =>
  // Outer reduce concats arrays built by inner reduce
    Object.keys(obj).reduce((accumulator, list) =>
      // Inner reduce builds an array out of the lists
      accumulator.concat(Object.keys(obj[list]).reduce((acc2, item) =>
        acc2.concat(obj[list][item]), [])), []);

  // Remove duplicates from array
  const uniqify = (arr) => {
    const seen = new Set();
    return arr.filter(item => (seen.has(item.media.idMal) ? false : seen.add(item.media.idMal)));
  };

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
            startedAt {
              year
              month
              day
            }
            completedAt {
              year
              month
              day
            }
            repeat
            notes
            media {
              idMal
              title {
                romaji
              }
            }
          },
          customLists {
            status
            score(format:POINT_10)
            progress
            startedAt {
              year
              month
              day
            }
            completedAt {
              year
              month
              day
            }
            repeat
            notes
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
            startedAt {
              year
              month
              day
            }
            completedAt {
              year
              month
              day
            }
            repeat
            notes
            media {
              idMal
              title {
                romaji
              }
            }
          },
          customLists {
            status
            score(format:POINT_10)
            progress
            progressVolumes
            startedAt {
              year
              month
              day
            }
            completedAt {
              year
              month
              day
            }
            repeat
            notes
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
    .then(res => res.data)
    .then(res => ({
      anime: uniqify(flatten(res.anime)),
      manga: uniqify(flatten(res.manga)),
    }));

  const sanitize = (item, type) => ({
    type,
    progress: item.progress,
    progressVolumes: item.progressVolumes,
    startedAt: item.startedAt,
    completedAt: item.completedAt,
    repeat: item.repeat,
    notes: item.notes,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji,
  });

  return {
    getList: username =>
      fetchList(username)
        .then(lists => [
          ...lists.anime.map(item => sanitize(item, 'anime')),
          ...lists.manga.map(item => sanitize(item, 'manga')),
        ])
        .catch((err) => {
          console.error('Anilist getList error', err);
          return `No data found for user ${username}`;
        }),
  };
})();

module.exports = Anilist;
