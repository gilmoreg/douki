const fetchMock = require('fetch-mock');
const Mal = require('../../assets/mal');
const fakes = require('../../helpers/fakes');

describe('Client side MAL', () => {
  beforeEach(() => {
    // Throw error on any fetch calls that aren't mocked
    fetchMock.catch(500);
  });

  afterEach(() => {
    fetchMock.restore();
  });

  it('check with valid credentials', () => {
    fetchMock.mock('*', fakes.malValidCheckResponse);
    return Mal.check('test', 'test')
    .then((res) => {
      expect(res).toEqual(true);
    });
  });

  it('check with invalid credentials', () => {
    fetchMock.mock('*', fakes.malInvalidCheckResponse);
    return Mal.check('test', 'test')
    .then((res) => {
      expect(res).toEqual(false);
    });
  });

  it('add should add an anime', () => {
    fetchMock.mock('/mal/add', fakes.malAddSuccess);
    return Mal.add('auth', 'test')
      .then((res) => {
        expect(res).toBe('Created');
      });
  });

  it('check should handle an error from Google Cloud proxy', () => {
    fetchMock.mock('*', { throws: 'Error' });
    return Mal.check('test', 'test')
      .catch((res) => {
        expect(res).toBe('Error');
      });
  });

  it('add should handle an error from MAL', () => {
    fetchMock.mock('*', { throws: 'Error' });
    return Mal.add('auth', 'test')
      .catch((res) => {
        expect(res).toBe('Error');
      });
  });

  it('getList should return a list with valid username', () => {
    fetchMock.mock(/.+malAppInfoProxy.+anime/, fakes.malAppInfoAnimeSuccess);
    fetchMock.mock(/.+malAppInfoProxy.+manga/, fakes.malAppInfoMangaSuccess);
    return Mal.getList('test')
      .then((res) => {
        expect(res.anime).toBeDefined();
        expect(res.manga).toBeDefined();
      });
  });

  it('getList should throw on invalid username', () => {
    fetchMock.mock(/.+malAppInfoProxy.+anime/, fakes.malAppInfoFailure);
    fetchMock.mock(/.+malAppInfoProxy.+manga/, fakes.malAppInfoFailure);
    return Mal.getList('test')
      .catch((err) => {
        expect(err.message).toEqual('Unable to retrieve MAL lists for user test');
      });
  });
});
