/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect, jest */
// const express = require('express');
// const chai = require('chai');
// const chaiHttp = require('chai-http');
const { catchErrors } = require('../handlers/errors');
/*
const app = express();
chai.use(chaiHttp);

// Middleware to throw errors
app.get('/error', (req, res, next) => {
  next(Error('error'));
});

app.use(errorHandlers.notFound);
app.use(errorHandlers.developmentErrors);
app.use(errorHandlers.productionErrors);

let server;

describe('Error Handlers', () => {
  beforeEach(() => {
    server = app.listen(5000);
  });
  afterEach(() => {
    server.close();
  });

  it('should respond with not found', (done) => {
    chai.request(app)
      .get('/doesnotexist')
      .end((err, res) => {
        expect(res.status).toEqual(404);
        done();
      });
  });

  it('should respond with production and development errors', (done) => {
    chai.request(app)
      .get('/error')
      .end((err, res) => {
        expect(res.status).toEqual(500);
        done();
      });
  });
}); */

describe('Error handler middlewares', () => {
  it('catchErrors middleware catches a Promise.reject', (done) => {
    const req = {};
    const res = {};

    const route = () => Promise.reject('testing error');
    const routeWithCatcher = catchErrors(route);
    const next = (err) => {
      expect(err).toEqual('testing error');
      done();
    };
    routeWithCatcher(req, res, next);
  });

  it('catchErrors middleware does not invoke next when no error', () => {
    const req = {};
    const res = {};

    const route = () => Promise.resolve('testing success');
    const routeWithCatcher = catchErrors(route);
    const next = jest.fn();
    routeWithCatcher(req, res, next);
    expect(next.mock.calls.length).toBe(0);
  });
});
