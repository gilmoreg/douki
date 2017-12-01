/* eslint-disable no-unused-vars */
const xml2js = require('xml2js');
global.fetch = require('node-fetch');

const parser = new xml2js.Parser();

// Rate limiting
const callQueue = [];
setInterval(() => {
  if (callQueue.length) {
    const [auth, url, cb] = callQueue.shift();
    fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })
    .then(mal => mal.text())
    .then(mal => cb(mal))
    .catch(err => Error(err));
  }
}, 250);

const malAPICall = (auth, url, cb) => {
  callQueue.push([auth, url, cb]);
};

const addToMal = (auth, type, id, xml) =>
  new Promise((resolve, reject) => {
    malAPICall(auth,
      `https://myanimelist.net/api/${type}list/add/${id}.xml?data=${xml}`,
      mal => resolve(mal));
  });

const updateMal = (auth, type, id, xml) =>
  new Promise((resolve, reject) => {
    malAPICall(auth,
      `https://myanimelist.net/api/${type}list/update/${id}.xml?data=${xml}`,
      mal => resolve(mal));
  });


const getStatus = (status) => {
// MAL status: 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
  switch (status.trim()) {
    case 'CURRENT': return 1;
    case 'COMPLETED': return 2;
    case 'PAUSED': return 3;
    case 'DROPPED': return 4;
    case 'PLANNING': return 6;
    default: throw new Error(`unknown status "${status}"`);
  }
};

// AL date object is { year, month, day }, MAL takes yyyy-mm-dd
// AL will have null year, month, day if no data
const formatDate = date => (date.year ?
  `${date.year}-${date.month < 10 ? '0' : ''}${date.month}-${date.day < 10 ? '0' : ''}${date.day}`
  : '');

const makeAnimeXML = a =>
  encodeURIComponent(`
    <?xml version="1.0" encoding="UTF-8"?>
    <entry>
      <episode>${a.progress || ''}</episode>
      <status>${getStatus(a.status)}</status>
      <score>${a.score || ''}</score>
      <storage_type></storage_type>
      <storage_value></storage_value>
      <times_rewatched>${a.repeat || ''}</times_rewatched>
      <rewatch_value></rewatch_value>
      <date_start>${formatDate(a.startedAt)}</date_start>
      <date_finish>${formatDate(a.completedAt)}</date_finish>
      <priority></priority>
      <enable_discussion></enable_discussion>
      <enable_rewatching></enable_rewatching>
      <comments>${a.notes || ''}</comments>
      <tags></tags>
    </entry>
    `.trim().replace(/(\r\n|\n|\r)/gm, ''));

const makeMangaXML = m =>
  encodeURIComponent(`
    <?xml version="1.0" encoding="UTF-8"?>
    <entry>
      <chapter>${m.progress || ''}</chapter>
      <volume>${m.progressVolumes || ''}</volume>
      <status>${getStatus(m.status)}</status>
      <score>${m.score || ''}</score>
      <times_reread>${m.repeat || ''}</times_reread>
      <reread_value></reread_value>
      <date_start>${formatDate(m.startedAt)}</date_start>
      <date_finish>${formatDate(m.completedAt)}</date_finish>
      <priority></priority>
      <enable_discussion></enable_discussion>
      <enable_rewatching></enable_rewatching>
      <comments>${m.notes || ''}</comments>
      <scan_group></scan_group>
      <tags></tags>
      <retail_volumes></retail_volumes>        
    </entry>
    `.trim().replace(/(\r\n|\n|\r)/gm, ''));

const sync = ({ auth, anilist }, mode) =>
  new Promise(async (resolve, reject) => {
    const xml = anilist.type === 'anime' ?
      makeAnimeXML(anilist) :
      makeMangaXML(anilist);
    const malResponse = mode === 'add' ?
      await addToMal(auth, anilist.type, anilist.id, xml) :
      await updateMal(auth, anilist.type, anilist.id, xml);
    if (malResponse) resolve(malResponse);
    else resolve(null);
  });

module.exports = {
  // POST /mal/add { auth, anilist }
  add: async (req, res) => {
    const result = await sync(req.body, 'add');
    // If the item is already in the list, it won't be updated unless we do this
    if (result.match(/.+\(id: \d+\) is already in the list./g)) {
      const updateResult = await sync(req.body, 'update');
      res.status(200).json(updateResult);
    } else res.status(200).json(result);
  },
};
