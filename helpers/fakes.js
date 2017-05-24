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

  malAddFail: {
    message: 'Invalid ID',
    title: 'test',
  },

  aniList: {
    episodes_watched: 0,
    list_status: 'plan to watch',
    score: 0,
    priority: 0,
    notes: '',
    title: 'test',
  },

  aniListResponse: {
    id: 0,
    lists: {
      completed: [
        {
          record_id: 0,
          list_status: 'completed',
          score: 0,
          episodes_watched: 0,
          anime: {
            id: 0,
            title_romaji: 'test',
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
