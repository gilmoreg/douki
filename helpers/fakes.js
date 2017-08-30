module.exports = {
  malValidCheckResponse: {
    success: '<?xml version="1.0" encoding="utf-8"?>\n<user>\n  <id>000000</id>\n  <username>test</username>\n</user>\n',
  },

  malInvalidCheckResponse: {
    success: 'Invalid credentials',
  },

  malAnimeAddAlreadyInList: {
    body: {
      message: 'The anime (id: 0) is already in the list.',
      title: 'test',
    },
  },

  malAddSuccess: {
    message: 'Created',
    title: 'test',
  },

  malUpdateSuccess: {
    message: 'Updated',
    title: 'test',
  },

  malMangaAddAlreadyInList: {
    body: {
      message: 'The manga (id: 0) is already in the list.',
      title: 'test',
    },
  },

  malAddFail: {
    message: 'Invalid ID',
    title: 'test',
  },

  aniListAnime: {
    id: 0,
    progress: 0,
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
    status: 'PLANNING',
    score: 0,
    priority: 0,
    title: 'test',
    type: 'manga',
  },

  aniListResponse: {
    data: {
      anime: {
        statusLists: [
          {
            status: 'COMPLETED',
            score: 10,
            progress: 12,
            media: {
              idMal: 0,
              title: {
                romaji: 'test',
              },
            },
          },
        ],
      },
      manga: {
        statusLists: [
          {
            status: 'COMPLETED',
            score: 10,
            progress: 12,
            progressVolumes: 1,
            media: {
              idMal: 0,
              title: {
                romaji: 'test',
              },
            },
          },
        ],
      },
    },
  },

  aniListEmptyResponse: {
    error: {
      status: 404,
      messages: [
        'No query results for model [App\\AniList\\v1\\User\\User] test',
      ],
    },
  },
};
