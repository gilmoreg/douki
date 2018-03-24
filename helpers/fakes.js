module.exports = {
  // Google Cloud Function responses
  malValidCheckResponse: {
    success: '<?xml version="1.0" encoding="utf-8"?>\n<user>\n  <id>000000</id>\n  <username>test</username>\n</user>\n',
  },

  malInvalidCheckResponse: {
    success: 'Invalid credentials',
  },

  malAppInfoAnimeSuccess: '{"result":{"myanimelist":{"myinfo":[{}],"anime":[{"series_animedb_id":["1"],"series_title":["Cowboy Bebop"],"series_synonyms":["; Cowboy Bebop"],"series_type":["1"],"series_episodes":["26"],"series_status":["2"],"series_start":["1998-04-03"],"series_end":["1999-04-24"],"series_image":["https://myanimelist.cdn-dena.com/images/anime/4/19644.jpg"],"my_id":["0"],"my_watched_episodes":["26"],"my_start_date":["0000-00-00"],"my_finish_date":["0000-00-00"],"my_score":["10"],"my_status":["2"],"my_rewatching":["0"],"my_rewatching_ep":["0"],"my_last_updated":["1458019030"],"my_tags":[""]}]}}}',

  malAppInfoMangaSuccess: '{"result":{"myanimelist":{"myinfo":[{}],"manga":[{"series_mangadb_id":["780"],"series_title":["Take Moon"],"series_synonyms":[""],"series_type":["1"],"series_chapters":["29"],"series_volumes":["2"],"series_status":["2"],"series_start":["2002-07-25"],"series_end":["2005-09-24"],"series_image":["https://myanimelist.cdn-dena.com/images/manga/3/163.jpg"],"my_id":["52496684"],"my_read_chapters":["0"],"my_read_volumes":["0"],"my_start_date":["0000-00-00"],"my_finish_date":["0000-00-00"],"my_score":["0"],"my_status":["6"],"my_rereadingg":["0"],"my_rereading_chap":["0"],"my_last_updated":["1471325972"],"my_tags":[""]}]}}}',

  malAppInfoFailure: '{"result":{"myanimelist":""}}',

  // MAL Add/Update responses
  malAnimeAddAlreadyInList: 'The anime (id: 0) is already in the list.',
  malAddSuccess: 'Created',
  malUpdateSuccess: 'Updated',
  malMangaAddAlreadyInList: 'The manga (id: 0) is already in the list.',
  malAddFail: 'Invalid ID',
  malAuthFail: 'Too many invalid logins',

  aniListAnime: {
    id: 0,
    progress: 0,
    startedAt: {
      year: null,
      month: null,
      day: null,
    },
    completedAt: {
      year: null,
      month: null,
      day: null,
    },
    repeat: 0,
    notes: 'test',
    status: 'PLANNING',
    score: 0,
    priority: 0,
    title: 'test',
    type: 'anime',
  },

  aniListManga: {
    id: 0,
    progress: 0,
    progressVolumes: 0,
    startedAt: {
      year: null,
      month: null,
      day: null,
    },
    completedAt: {
      year: null,
      month: null,
      day: null,
    },
    repeat: 0,
    notes: 'test',
    status: 'PLANNING',
    score: 0,
    priority: 0,
    title: 'test',
    type: 'manga',
  },

  // AL responses

  aniListResponse: {
    data: {
      anime: {
        lists: [
          {
            entries: [
              {
                status: 'COMPLETED',
                score: 10,
                progress: 12,
                startedAt: {
                  year: 2017,
                  month: 1,
                  day: 1,
                },
                completedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                repeat: 0,
                media: {
                  idMal: 0,
                  title: {
                    romaji: 'test',
                  },
                },
              },
            ],
          },
          {
            entries: [
              {
                status: 'CURRENT',
                score: 0,
                progress: 0,
                startedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                completedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                repeat: 0,
                media: {
                  idMal: 1,
                  title: {
                    romaji: 'test',
                  },
                },
              },
            ],
          },
        ],
      },
      manga: {
        lists: [
          {
            entries: [
              {
                status: 'COMPLETED',
                score: 10,
                progress: 12,
                progressVolumes: 1,
                startedAt: {
                  year: 2017,
                  month: 1,
                  day: 1,
                },
                completedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                repeat: 0,
                media: {
                  idMal: 0,
                  title: {
                    romaji: 'test',
                  },
                },
              },
            ],
          },
          {
            entries: [
              {
                status: 'CURRENT',
                score: 0,
                progress: 0,
                progressVolumes: 0,
                startedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                completedAt: {
                  year: null,
                  month: null,
                  day: null,
                },
                repeat: 1,
                media: {
                  idMal: 1,
                  title: {
                    romaji: 'test',
                  },
                },
              },
            ],
          },
        ],
      },
    },
  },

  aniListEmptyResponse: {
    data: {
      anime: null,
      manga: null,
    },
    errors: [
      {
        message: 'Internal Server Error',
        status: 500,
      },
      {
        message: 'Internal Server Error',
        status: 500,
      },
    ],
  },
};
