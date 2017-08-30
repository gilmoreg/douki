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

  it('check with valid credentials', (done) => {
    fetchMock.mock('*', fakes.malValidCheckResponse);
    Mal.check('test', 'test')
    .then((res) => {
      expect(res).toEqual(true);
      done();
    });
  });

  it('check with invalid credentials', (done) => {
    fetchMock.mock('*', fakes.malInvalidCheckResponse);
    Mal.check('test', 'test')
    .then((res) => {
      expect(res).toEqual(false);
      done();
    });
  });

  it('add should add an anime', (done) => {
    fetchMock.mock('*', fakes.malAddSuccess);
    Mal.add('auth', 'test')
    .then((res) => {
      expect(res).toMatchSnapshot();
      done();
    });
  });

  it('should handle an error from Google Cloud proxy', (done) => {
    fetchMock.mock('*', { throws: 'Error' });
    Mal.check('test', 'test')
    .then((res) => {
      expect(res).toMatchSnapshot();
      done();
    });
  });

  it('should handle an error from MAL', (done) => {
    fetchMock.mock('*', { throws: 'Error' });
    Mal.add('auth', 'test')
    .then((res) => {
      expect(res).toMatchSnapshot();
      done();
    });
  });
});
