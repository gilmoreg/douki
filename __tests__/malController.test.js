/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const chai = require('chai');
const chaiHttp = require('chai-http');
const fetchMock = require('fetch-mock');
const malController = require('../controllers/mal');
const fakes = require('./fakes');

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

  it('/mal/add', (done) => {
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
        expect(title).toEqual('test');
        expect(malID).toEqual('269');
        done();
      });
  });
});

