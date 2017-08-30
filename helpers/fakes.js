module.exports = {
  malXML: '<?xml version="1.0" encoding="utf-8"?><anime><entry><id>269</id></entry></anime>',

  malSearchResponse: {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
    body: '<?xml version="1.0" encoding="utf-8"?><anime><entry><id>269</id></entry></anime>',
    sendAsJson: false,
  },

  malSearchFail: {
    status: 204,
  },

  malValidCheckResponse: {
    success: '<?xml version="1.0" encoding="utf-8"?>\n<user>\n  <id>000000</id>\n  <username>test</username>\n</user>\n',
  },

  malInvalidCheckResponse: {
    success: 'Invalid credentials',
  },

  malAuthSuccess: {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
    },
    body: '<?xml version="1.0" encoding="utf-8"?><user><id>0</id><username>test</username></user>',
  },

  malAuthFail: {
    status: 401,
    body: 'Invalid credentials',
  },

  malAddSuccess1: {
    body: {
      message: 'The anime (id: 0) is already in the list.',
      title: 'test',
    },
  },

  malAddSuccess2: {
    message: 'Created',
    title: 'test',
  },

  malUpdateSuccess: {
    message: 'Updated',
    title: 'test',
  },

  malAddFail: {
    message: 'Invalid ID',
    title: 'test',
  },

  aniList: {
    id: 0,
    progress: 0,
    status: 'PLANNING',
    score: 0,
    priority: 0,
    title: 'test',
  },

  aniListResponse: {
    data: {
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
