/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const IDHash = require('../models/IDHash');
// require('dotenv').config();
const parser = new xml2js.Parser();

const getDBmalID = aniTitle =>
  new Promise((resolve, reject) => {
    IDHash.findOne({ aniTitle }, { malID: true })
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const setDBmalID = (aniTitle, malID) =>
  new Promise((resolve, reject) => {
    IDHash.create({ aniTitle, malID })
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const malAPICall = (auth, url) =>
  fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
  .then(mal => mal.text());

const malAPISearch = (auth, title) =>
  new Promise((resolve, reject) => {
    malAPICall(auth, `https://myanimelist.net/api/anime/search.xml?q=${encodeURIComponent(title)}`)
    .then((res) => {
      if (res) {
        parser.parseString(res, (err, data) => {
          if (err) reject(err);
          resolve(data);
        });
      }
      resolve();
    })
    .catch(err => reject(err));
  });

const addToMal = (auth, id, xml) =>
  new Promise((resolve, reject) => {
    malAPICall(auth, `https://myanimelist.net/api/animelist/add/${id}.xml?data=${xml}`)
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const checkMalCredentials = auth =>
  new Promise((resolve, reject) => {
    malAPICall(auth, 'https://myanimelist.net/api/account/verify_credentials.xml')
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const searchMal = (auth, titles) => {
  console.log('searchMal', titles);
  // See if we have this match stored
  return new Promise(async (resolve, reject) => {
    // First item must always be Romaji, which is what the DB stores
    let malID = await getDBmalID(titles[0]);
    if (malID) resolve(malID);
    else {
      console.log('Nothing found. Try searching MAL');
      // Nothing in the DB. Try searching MAL
      // Romaji
      malID = await malAPISearch(auth, titles[0]);
      if (malID) resolve(malID);
      // English
      if (titles.length > 1) {
        malID = await malAPISearch(auth, titles[1]);
        if (malID) resolve(malID);
      }
      // Japanese
      if (titles.length > 2) {
        malID = await malAPISearch(auth, titles[2]);
        if (malID) resolve(malID);
      }
      // Nothing found
      reject(`${titles[0]} not found on MAL.`);
    }
  });
};

module.exports = {
  search: async (req, res) => {
    const result = await searchMal(req.body.auth, req.body.titles);
    if (result) {
      console.log('/mal/search', result);
      res.status(200).json(result);
    }
  },
  add: (req, res) => {
    addToMal(
      { username: req.body.username, password: req.body.password },
      req.body.id,
      req.body.xml)
    .then((results) => {
      res.status(200).json(results);
    })
    .catch(err => res.status(400).json({ error: err }));
  },
  check: async (req, res) => {
    const results = await checkMalCredentials(req.body.auth);
    if (results) res.status(200).json(results);
  },
};
