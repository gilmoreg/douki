/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const fetchMock = require('fetch-mock');
const Anilist = require('../../assets/anilist');
const { aniListResponse, aniListEmptyResponse } = require('../../helpers/fakes');

describe('Client side Anilist', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('getList with one result', (done) => {
    fetchMock.mock('*', aniListResponse);
    Anilist.getList('test')
    .then((list) => {
      expect(list[0]).toBeDefined();
      done();
    });
  });

  it('getList with empty results', (done) => {
    fetchMock.mock('*', aniListEmptyResponse);
    Anilist.getList('test')
    .then((list) => {
      expect(list.length).toEqual(0);
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
