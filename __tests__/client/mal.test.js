/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const fetchMock = require('fetch-mock');
const Mal = require('../../assets/mal');
const { malAuthSuccess, malAuthFail, malAddSuccess1 } = require('../../helpers/fakes');

describe('Client side MAL', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('check with valid credentials', (done) => {
    fetchMock.mock('*', '"<?xml version="1.0" encoding="utf-8"?>\n<user>\n  <id>0</id>\n  <username>test</username>\n</user>\n"');
    Mal.check('test', 'test')
    .then((res) => {
      console.log('mal check', res);
      done();
    });
  });

  /*
  it('check with invalid credentials', (done) => {
    fetchMock.mock('*', {});
  });

  it('add with valid id', (done) => {
    fetchMock.mock('*', {});
  });

  it('add with invalid id', (done) => {
    fetchMock.mock('*', {});
  }); */
});
