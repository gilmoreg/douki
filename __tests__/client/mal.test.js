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

  /*
  it('add with valid id', (done) => {
    fetchMock.mock('*', {});
  });

  it('add with invalid id', (done) => {
    fetchMock.mock('*', {});
  }); */
});
