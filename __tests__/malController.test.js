/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const chai = require('chai');
const chaiHttp = require('chai-http');
const fetchMock = require('fetch-mock');
const malController = require('../controllers/mal');
const fakes = require('../helpers/fakes');

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('malController', () => {
  beforeEach(() => {
    runServer(5000);
  });
  afterEach(() => {
    fetchMock.restore();
    closeServer();
  });

  it('Should update an anime if already in the list', (done) => {
    fetchMock.mock('*', new Error('unmatched fetch'));
    fetchMock.mock(/.+animelist\/add.+/g, fakes.malAddSuccess1);
    fetchMock.mock(/.+animelist\/update.+/g, fakes.malUpdateSuccess);
    chai.request(app)
      .post('/mal/add')
      .send({
        auth: 'auth',
        anilist: fakes.aniList,
      })
      .then((res) => {
        expect(res.body).toMatchSnapshot();
        done();
      });
  });
});

