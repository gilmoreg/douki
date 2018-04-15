const Anilist = (() => {
  /*
    Anilist response takes the following form:
    data: {
      anime: {
        lists: [
          { entries: [] },
          { entries: [] },
          etc.
        },
      },
      manga: {
        lists: [
          { entries: [] },
          { entries: [] },
          etc.
        },
      }
    }
    'data' is stripped off by the fetch function, and flatten() is called once for
    anime and once for manga

    flatten() combines the lists (completed, planning, all custom lists, etc)
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
          lists {
            entries {
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
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        },
        manga: MediaListCollection(userName: $userName, type: MANGA) {
          lists {
            entries {
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
              media {
                idMal
                title {
                  romaji
                }
              }
            }
          }
        }
      }
    `, { userName })
    .then(res => res.json())
    .then(res => res.data)
    .then(res => ({
      anime: uniqify(flatten(res.anime.lists)),
      manga: uniqify(flatten(res.manga.lists)),
    }));

  const sanitize = (item, type) => ({
    type,
    progress: item.progress,
    progressVolumes: item.progressVolumes,
    startedAt: {
      year: item.startedAt.year || 0,
      month: item.startedAt.month || 0,
      day: item.startedAt.day || 0,
    },
    completedAt: {
      year: item.completedAt.year || 0,
      month: item.completedAt.month || 0,
      day: item.completedAt.day || 0,
    },
    repeat: item.repeat,
    status: item.status,
    score: item.score,
    id: item.media.idMal,
    title: item.media.title.romaji,
  });

  return {
    getList: username =>
      fetchList(username)
      .then(lists => [
        ...lists.anime.map(item => sanitize(item, 'anime')).filter(item => item.id),
        ...lists.manga.map(item => sanitize(item, 'manga')).filter(item => item.id),
      ])
      .catch((err) => {
        console.error('Anilist getList error', err);
        return `No data found for user ${username}`;
      }),
  };
})();

module.exports = Anilist;
