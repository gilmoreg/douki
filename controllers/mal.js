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

const malCheckResponse = mal =>
  new Promise((resolve, reject) => {
    if (mal) {
      if (mal === 'Invalid credentials') resolve(mal);
      parser.parseString(mal, async (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    }
    return reject('Empty response from MAL on auth check');
  });

const checkMalCredentials = auth =>
  new Promise((resolve, reject) => {
    malAPICall(auth,
      'https://myanimelist.net/api/account/verify_credentials.xml',
      mal => resolve(malCheckResponse(mal)));
  });

const addToMal = (auth, id, xml) =>
  new Promise((resolve, reject) => {
    malAPICall(auth,
      `https://myanimelist.net/api/animelist/add/${id}.xml?data=${xml}`,
      mal => resolve(mal));
  });

const updateMal = (auth, id, xml) =>
  new Promise((resolve, reject) => {
    malAPICall(auth,
      `https://myanimelist.net/api/animelist/update/${id}.xml?data=${xml}`,
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
    default: {
      console.error(`unknown status "${status}"`);
      return '';
    }
  }
};

const makeAnimeXML = a =>
  encodeURIComponent(`
    <?xml version="1.0" encoding="UTF-8"?>
    <entry>
      <episode>${a.progress || ''}</episode>
      <status>${getStatus(a.status)}</status>
      <score>${a.score || ''}</score>
      <storage_type></storage_type>
      <storage_value></storage_value>
      <times_rewatched></times_rewatched>
      <rewatch_value></rewatch_value>
      <date_start></date_start>
      <date_finish></date_finish>
      <priority></priority>
      <enable_discussion></enable_discussion>
      <enable_rewatching></enable_rewatching>
      <comments></comments>
      <tags></tags>
    </entry>
    `.trim().replace(/(\r\n|\n|\r)/gm, ''));

const makeMangaXML = m =>
  encodeURIComponent(`
    <?xml version="1.0" encoding="UTF-8"?>
    <entry>
      <chapter>${m.progress || ''}</chapter>
      <volume>${m.volumes}</volume>
      <status>${getStatus(m.status)}</status>
      <score>${m.score || ''}</score>
      <times_reread></times_reread>
      <reread_value></reread_value>
      <date_start></date_start>
      <date_finish></date_finish>
      <priority></priority>
      <enable_discussion></enable_discussion>
      <enable_rewatching></enable_rewatching>
      <comments></comments>
      <scan_group></scan_group>
      <tags></tags>
      <retail_volumes></retail_volumes>        
    </entry>
    `.trim().replace(/(\r\n|\n|\r)/gm, ''));

const sync = ({ auth, anilist }, mode) =>
  new Promise(async (resolve, reject) => {
    const xml = makeAnimeXML(anilist);
    const malResponse = mode === 'add' ?
      await addToMal(auth, anilist.id, xml) :
      await updateMal(auth, anilist.id, xml);
    if (malResponse) {
      resolve({
        message: malResponse,
        title: anilist.title,
      });
    } else resolve(null);
  });

module.exports = {
  // POST /mal/add { auth, anilist }
  add: async (req, res) => {
    console.log('adding');
    const result = await sync(req.body, 'add');
    console.log(result);
    // If the anime is already in the list, it won't be updated unless we do this
    if (result.message.match(/The anime \(id: \d+\) is already in the list./g)) {
      const updateResult = await sync(req.body, 'update');
      res.status(200).json(updateResult);
    } else res.status(200).json(result);
  },
  // POST /mal/check { auth }
  check: async (req, res) => {
    const results = await checkMalCredentials(req.body.auth);
    res.status(200).json(results);
  },
};
