/* globals $ */
const statusCodes = ['', 'CURRENT', 'COMPLETED', 'PAUSED', 'DROPPED', '', 'PLANNING'];

const buildDate = (dateString) => {
  const parts = dateString.split('-');
  return {
    year: Number(parts[0]),
    month: Number(parts[1]),
    day: Number(parts[2]),
  };
};

const sanitizeAnimeListing = item => ({
  type: 'anime',
  id: Number(item.series_animedb_id[0]),
  progress: Number(item.my_watched_episodes[0]),
  startedAt: buildDate(item.my_start_date[0]),
  completedAt: buildDate(item.my_finish_date[0]),
  status: statusCodes[item.my_status[0]],
  score: Number(item.my_score[0]),
  repeat: Number(item.my_rewatching[0]),
});

const sanitizeMangaListing = item => ({
  type: 'manga',
  id: Number(item.series_mangadb_id[0]),
  progress: Number(item.my_read_chapters[0]),
  progressVolumes: Number(item.my_read_volumes[0]),
  startedAt: buildDate(item.my_start_date[0]),
  completedAt: buildDate(item.my_finish_date[0]),
  status: statusCodes[item.my_status[0]],
  score: Number(item.my_score[0]),
  repeat: Number(item.my_rereadingg[0]), // sic, spelling error is MAL's
});

const getMalAppInfoList = (user, type) =>
  fetch(`https://us-central1-douki-178418.cloudfunctions.net/malAppInfoProxy?user=${user}&type=${type}`)
  .then(res => res.json())
  .then(res => res.result.myanimelist)
  .then(list => list.anime || list.manga);

const Mal = (() => {
  let auth = '';

  return {
    check: (user, pass) => {
      const authCheck = btoa(`${user}:${pass}`);
      const url = `https://us-central1-douki-178418.cloudfunctions.net/mal-proxy/check?auth=${authCheck}`;
      return fetch(url)
        .then(res => res.json())
        .then((res) => {
          if (res.success && res.success.includes('username')) {
            auth = authCheck;
            return true;
          }
          return false;
        });
    },

    getList: (user) => {
      const fetchAnimeList = getMalAppInfoList(user, 'anime');
      const fetchMangaList = getMalAppInfoList(user, 'manga');
      return Promise.all([fetchAnimeList, fetchMangaList])
        .then((lists) => {
          if (!lists[0] || !lists[1]) throw new Error(`Unable to retrieve MAL lists for user ${user}`);
          const hashTable = {
            anime: {},
            manga: {},
          };
          lists[0].forEach((item) => {
            const anime = sanitizeAnimeListing(item);
            hashTable.anime[anime.id] = anime;
          });
          lists[1].forEach((item) => {
            const manga = sanitizeMangaListing(item);
            hashTable.manga[manga.id] = manga;
          });
          return hashTable;
        });
    },

    add: anilist =>
      fetch('/mal/add', {
        method: 'post',
        body: JSON.stringify({ auth, anilist }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.text())
      // Strip off leading and tailing double quotes
      .then(text => text.replace(/"/g, '')),
  };
})();

module.exports = Mal;
