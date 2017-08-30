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
    fetchMock.catch(500);
    runServer(5000);
  });
  afterEach(() => {
    fetchMock.restore();
    closeServer();
  });

  it('Should update an anime if already in the list', (done) => {
    fetchMock.mock(/.+animelist\/add.+/g, fakes.malAnimeAddAlreadyInList);
    fetchMock.mock(/.+animelist\/update.+/g, fakes.malUpdateSuccess);
    chai.request(app)
      .post('/mal/add')
      .send({
        auth: 'auth',
        anilist: fakes.aniListAnime,
      })
      .then((res) => {
        expect(res.body).toMatchSnapshot();
        done();
      });
  });

  it('Should update a manga if it is already in the list', (done) => {
    fetchMock.mock(/.+mangalist\/add.+/g, fakes.malMangaAddAlreadyInList);
    fetchMock.mock(/.+mangalist\/update.+/g, fakes.malUpdateSuccess);
    chai.request(app)
      .post('/mal/add')
      .send({
        auth: 'auth',
        anilist: fakes.aniListManga,
      })
      .then((res) => {
        expect(res.body).toMatchSnapshot();
        done();
      });
  });
});

