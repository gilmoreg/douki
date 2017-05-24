/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const fetchMock = require('fetch-mock');
require('../assets/app');

describe('Front end tests', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('sync', () => {

  });
});

/*
Would have to:
  Create a virtual dom with several elements
  Create a mock Anilist (as well as a fake response for a bad userid)
  Create a mock MAL success and fail
  With the revealing module pattern, you could only evaluate the end result of it all,
  not the ongoing DOM updates etc.
  The trick for this would be to modularize the code much more heavily and then
  mock parts of it in separate tests
*/
