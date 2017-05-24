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

  it('/mal/add success', (done) => {
    fetchMock.mock(/.+search.+/g, fakes.malSearchResponse);
    fetchMock.mock(/.+add\/.+/g, fakes.malAddSuccess1);
    chai.request(app)
      .post('/mal/add')
      .send({
        auth: 'auth',
        anilist: fakes.aniList,
      })
      .end((err, res) => {
        const { malID, title } = res.body;
        expect(err).toEqual(null);
        expect(title).toEqual('test');
        expect(malID).toEqual('269');
        done();
      });
  });

  it('/mal/add search fail response', (done) => {
    // Search returns empty on no results
    fetchMock.mock(/.+search.+/g, fakes.malSearchFail);
    // fetchMock.mock(/.+add\/.+/g, fakes.malAddFail);
    chai.request(app)
      .post('/mal/add')
      .send({
        auth: 'auth',
        anilist: fakes.aniList,
      })
      .end((err, res) => {
        expect(err).toEqual(null);
        expect(res.body).toEqual(null);
        console.log(res.body);
        done();
      });
  });

  it('/mal/check should verify genuine credentials', (done) => {
    fetchMock.mock(/.+account.+/g, fakes.malAuthSuccess);
    chai.request(app)
      .post('/mal/check')
      .send({
        auth: 'test',
      })
      .end((err, res) => {
        expect(err).toEqual(null);
        expect(res.body).toBeDefined();
        done();
      });
  });

  it('/mal/check should reject invalid credentials', (done) => {
    fetchMock.mock(/.+account.+/g, fakes.malAuthFail);
    chai.request(app)
      .post('/mal/check')
      .send({
        auth: 'test',
      })
      .end((err, res) => {
        expect(err).toEqual(null);
        expect(res.body).toEqual('Invalid credentials');
        done();
      });
  });
});

