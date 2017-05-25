/* eslint-disable no-unused-vars */
/* globals describe, it, beforeEach, afterEach, expect, jest */
const express = require('express');
const chai = require('chai');
const chaiHttp = require('chai-http');
const errorHandlers = require('../handlers/errors');
const httpMocks = require('node-mocks-http');

chai.use(chaiHttp);
let app;
let server;

describe('catchErrors Handler', () => {
  it('catchErrors middleware catches a Promise.reject', (done) => {
    const req = {};
    const res = {};

    const route = () => Promise.reject('testing error');
    const routeWithCatcher = errorHandlers.catchErrors(route);
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
    const routeWithCatcher = errorHandlers.catchErrors(route);
    const next = jest.fn();
    routeWithCatcher(req, res, next);
    expect(next.mock.calls.length).toBe(0);
  });
});

describe('Error Reporting Middleware', () => {
  beforeEach(() => {
    app = express();
  });
  afterEach(() => {
    server.close();
  });

  it('should respond with not found', (done) => {
    app.use(errorHandlers.notFound);
    server = app.listen(5000);

    chai.request(app)
      .get('/doesnotexist')
      .end((err, res) => {
        expect(res.status).toEqual(404);
        done();
      });
  });

  it('should respond with development errors', () => {
    const err = {
      stack: 'test-stack',
      message: 'test-error',
      status: 500,
    };
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    res.status = jest.fn();
    res.json = jest.fn();
    errorHandlers.developmentErrors(err, req, res);
    expect(res.status.mock.calls[0][0]).toBe(500);
    const json = res.json.mock.calls[0][0];
    expect(json.message).toBe('test-error');
    expect(json.status).toBe(500);
    expect(json.stackHighlighted).toBe('test-stack');
  });

  it('should respond with production errors', () => {
    const err = {
      stack: 'test-stack',
      message: 'test-error',
      status: 500,
    };
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();
    res.status = jest.fn();
    res.json = jest.fn();
    errorHandlers.productionErrors(err, req, res);
    expect(res.status.mock.calls[0][0]).toBe(500);
    const json = res.json.mock.calls[0][0];
    expect(json.message).toBe('test-error');
  });
});
