const fetchMock = require('fetch-mock');
const Anilist = require('../../assets/anilist');
const fakes = require('../../helpers/fakes');

describe('Client side Anilist', () => {
  beforeEach(() => fetchMock.catch(500));
  afterEach(() => fetchMock.restore());

  it('getList should return a valid list', (done) => {
    fetchMock.mock('*', fakes.aniListResponse);
    Anilist.getList('test')
    .then((list) => {
      expect(list).toMatchSnapshot();
      done();
    });
  });

  it.only('getList with empty results', (done) => {
    fetchMock.mock('*', fakes.aniListEmptyResponse);
    Anilist.getList('test')
    .then((list) => {
      console.log(list);
      done();
    });
  });

  it('getList with network error', (done) => {
    fetchMock.mock('*', { throws: Error('timeout') });
    Anilist.getList('test')
    .then((list) => {
      expect(list.length).toEqual(0);
      done();
    });
  });
});
