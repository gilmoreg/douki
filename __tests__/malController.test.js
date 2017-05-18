/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const fetchMock = require('fetch-mock');
const malController = require('../controllers/mal');

const fakeMalResponse = `
<?xml version="1.0" encoding="utf-8"?>
<anime>
    <entry>
        <id>269</id>
    </entry>
</anime>
`;

describe('malController', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('returns valid data on correct fetch', (done) => {
    fetchMock.mock('https://myanimelist.net/api/anime/search.xml?q=bleach',
      fakeMalResponse);
    malController.malAPISearch('', 'bleach')
    .then((res) => {
      console.log(res);
      done();
    });
  });
});

