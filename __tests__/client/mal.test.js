/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const fetchMock = require('fetch-mock');
const Mal = require('../../assets/mal');
const fakes = require('../../helpers/fakes');

describe('Client side MAL', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('check with valid credentials', (done) => {
    fetchMock.mock('/mal/check', { user: 'test', id: 0 }, { method: 'post' });
    Mal.check('test', 'test')
    .then((res) => {
      expect(res).toEqual(true);
      done();
    });
  });

  it('check with invalid credentials', (done) => {
    fetchMock.mock('/mal/check', { }, { method: 'post' });
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
