/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');
const btoa = require('btoa');
const xml2js = require('xml2js');

// require('dotenv').config();
const parser = new xml2js.Parser();

const addToMal = (credentials, id, xml) =>
  new Promise((resolve, reject) => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    fetch(`https://myanimelist.net/api/animelist/add/${id}.xml?data=${xml}`, {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const checkMalCredentials = credentials =>
  new Promise((resolve, reject) => {
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    fetch('https://myanimelist.net/api/account/verify_credentials.xml', {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const searchMal = (credentials, title) =>
  new Promise((resolve, reject) => {
    const uriTitle = encodeURIComponent(title);
    const auth = btoa(`${credentials.username}:${credentials.password}`);
    fetch(`https://myanimelist.net/api/anime/search.xml?q=${uriTitle}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
      mode: 'no-cors',
    })
    .then(mal => mal.text())
    .then((res) => {
      parser.parseString(res, (err, data) => {
        if (err) reject(err);
        console.log('mal search', data);
        resolve(data);
      });
    })
    .catch(err => reject(err));
  });

module.exports = {
  search: (req, res) => {
    searchMal(
      { username: req.body.username, password: req.body.password },
      req.params.title,
    )
    .then((results) => {
      console.log('/mal/search/:title', results);
      res.status(200).json(results);
    })
    .catch(err => res.status(400).json({ error: err }));
  },
  add: (req, res) => {
    addToMal(
      { username: req.body.username, password: req.body.password },
      req.body.id,
      req.body.xml,
    )
    .then((results) => {
      res.status(200).json(results);
    })
    .catch(err => res.status(400).json({ error: err }));
  },
  check: (req, res) => {
    checkMalCredentials({ username: req.body.username, password: req.body.password })
    .then((results) => {
      res.status(200).json(results);
    })
    .catch(err => res.status(400).json({ error: err }));
  },
};
