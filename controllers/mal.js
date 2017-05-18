/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const mongoose = require('mongoose');
const IDHash = require('../models/IDHash');
// require('dotenv').config();
const parser = new xml2js.Parser();

const RateLimiter = require('limiter').RateLimiter;

const limiter = new RateLimiter(1, 50);

const parseMalID = (malRes) => {
  if (malRes && malRes.anime && malRes.anime.entry) {
    return malRes.anime.entry[0].id[0];
  }
  return null;
};

const getDBmalID = aniTitle =>
  new Promise((resolve, reject) => {
    IDHash.findOne({ aniTitle }, { malID: true, _id: false })
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const setDBmalID = (aniTitle, malID) =>
  new Promise((resolve, reject) => {
    IDHash.findOneAndUpdate(
      { aniTitle, malID: parseInt(malID, 10) },
      { aniTitle, malID: parseInt(malID, 10) },
      { upsert: true, new: true, runValidators: true })
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const malAPICall = (auth, url) =>
  // Use rate limiter on all MAL calls. Max one call every 50ms.
  new Promise((resolve, reject) => {
    limiter.removeTokens(1, () => {
      fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
      })
      .then(mal => resolve(mal.text()))
      .catch(err => reject(err));
    });
  });

const malAPISearch = (auth, title) =>
  new Promise((resolve, reject) => {
    malAPICall(auth, `https://myanimelist.net/api/anime/search.xml?q=${encodeURIComponent(title)}`)
    .then((res) => {
      if (res) {
        parser.parseString(res, async (err, data) => {
          if (err) reject(err);
          const malID = parseMalID(data);
          if (malID) {
            // Add this title/id hash to database
            const set = await setDBmalID(title, malID);
            console.log(set);
            // Return MAL ID
            resolve({ malID });
          }
          // Got a response but incorrectly formatted
          // Treat it as no results
          resolve(null);
        });
      }
      // Got no response - MAL's response on no results
      resolve(null);
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

const getMalID = (auth, title) =>
  new Promise(async (resolve, reject) => {
    let malID = await getDBmalID(title);
    if (malID) resolve(malID);
    else {
      // Nothing in the DB. Try searching MAL
      malID = await malAPISearch(auth, title);
      if (malID) resolve(malID);
      // Last resort - try screen scraping
      let html = await fetch(`https://myanimelist.net/anime.php?q=${encodeURIComponent(title)}`);
      try {
        html = await html.text();
        malID = html.split('<a class="hoverinfo_trigger')[1].split('https://myanimelist.net/anime/')[1].split('/')[0];
        resolve(parseInt(malID, 10));
      } catch (err) {
        console.log('scraping failed.', err);
      }
      // Nothing found
      reject();
    }
  });

const getStatus = (status) => {
// 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching'
// status. 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
  switch (status.trim()) {
    case 'watching': return 1;
    case 'completed': return 2;
    case 'on-hold':
    case 'on hold':
    case 'onhold':
    case 'on_hold': return 3;
    case 'dropped': return 4;
    case 'plan to watch':
    case 'plan_to_watch':
    case 'plantowatch': return 6;
    default: {
      console.log(`unknown status "${status}"`);
      return '';
    }
  }
};

const makeXML = a =>
  encodeURIComponent(`
    <?xml version="1.0" encoding="UTF-8"?>
    <entry>
      <episode>${a.episodes_watched || ''}</episode>
      <status>${getStatus(a.list_status)}</status>
      <score>${a.score || ''}</score>
      <storage_type></storage_type>
      <storage_value></storage_value>
      <times_rewatched></times_rewatched>
      <rewatch_value></rewatch_value>
      <date_start>${''}</date_start>
      <date_finish>${''}</date_finish>
      <priority>${a.priority || ''}</priority>
      <enable_discussion></enable_discussion>
      <enable_rewatching></enable_rewatching>
      <comments>${a.notes || ''}</comments>
      <tags></tags>
    </entry>
    `.trim().replace(/(\r\n|\n|\r)/gm, ''));

const sync = ({ auth, anilist }) =>
  new Promise(async (resolve, reject) => {
    const mal = await getMalID(auth, anilist.title);
    if (mal) {
      const xml = makeXML(anilist);
      const malResponse = await addToMal(auth, mal.malID, xml);
      if (malResponse) {
        resolve({
          message: malResponse,
          title: anilist.title,
          malID: mal.malID,
        });
      } else reject();
    }
  });

module.exports = {
  add: async (req, res) => {
    const result = await sync(req.body);
    res.status(200).json(result);
  },
  check: async (req, res) => {
    const results = await checkMalCredentials(req.body.auth);
    res.status(200).json(results);
  },
};
