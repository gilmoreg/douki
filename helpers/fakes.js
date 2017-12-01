module.exports = {
  // Google Cloud Function responses
  malValidCheckResponse: {
    success: '<?xml version="1.0" encoding="utf-8"?>\n<user>\n  <id>000000</id>\n  <username>test</username>\n</user>\n',
  },

  malInvalidCheckResponse: {
    success: 'Invalid credentials',
  },

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
        statusLists: {
          completed: [
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
              media: {
                idMal: 0,
                title: {
                  romaji: 'test',
                },
              },
            },
          ],
        },
        customLists: {
          customList: [
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
              media: {
                idMal: 1,
                title: {
                  romaji: 'test',
                },
              },
            },
          ],
        },
      },
      manga: {
        statusLists: {
          completed: [
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
              media: {
                idMal: 0,
                title: {
                  romaji: 'test',
                },
              },
            },
          ],
        },
        customLists: {
          customList: [
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
              media: {
                idMal: 1,
                title: {
                  romaji: 'test',
                },
              },
            },
          ],
        },
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
