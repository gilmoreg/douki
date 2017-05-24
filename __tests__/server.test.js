/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect */
const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');

chai.use(chaiHttp);

describe('Test Server', () => {
  beforeEach(() => {
    runServer(5000);
  });
  afterEach(() => {
    closeServer();
  });

  it('should start without errors', (done) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        expect(err).toBe(null);
        expect(res.status).toBe(200);
        done();
      });
  });
});

