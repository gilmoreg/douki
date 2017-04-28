/* import express from 'express';
import cors from 'cors';
import compression from 'compression'; */
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const btoa = require('btoa');
require('dotenv').config();

const parser = new xml2js.Parser();

/*
const app = express();
let server;

app.use(compression({ level: 9, threshold: 0 }));
app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: 'Accept, Origin, Content-Type, Referer',
  credentials: true,
}));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'ok' });
});

app.listen(4000); */
/*
const request = (host, path) =>
  new Promise((resolve, reject) => {
    const auth = btoa('solevul:#3Mal7g#');
    console.log('auth', auth);
    const req = https.request({
      host,
      path,
      method: 'get',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    }, (response) => {
      const body = [];
      response.on('data', chunk => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    req.on('error', err => reject(err));
    req.end();
  });
*/

const malSearch = title =>
  new Promise((resolve, reject) => {
    const uriTitle = encodeURIComponent(title);
    const auth = btoa(`${process.env.MAL_USER}:${process.env.MAL_PW}`);
    fetch(`https://myanimelist.net/api/anime/search.xml?q=${uriTitle}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then((res) => {
      parser.parseString(res, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    })
    .catch(err => reject(err));
  });

const malUpdate = (id, xml) =>
  new Promise((resolve, reject) => {
    const auth = btoa(`${process.env.MAL_USER}:${process.env.MAL_PW}`);
    fetch(`https://myanimelist.net/api/animelist/add/${id}.xml?data=${xml}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
      compress: true,
    })
    .then(mal => mal.text())
    .then(res => resolve(res))
    .catch(err => reject(err));
  });

const match = (anilist, mal) => {
  const aniYear = anilist.start_date_fuzzy.toString().substring(0, 4);
  const entries = mal.anime.entry;
  for (let i = 0; i < entries.length; i += 1) {
    const malYear = entries[i].start_date[0].substring(0, 4);
    // Since titles can be similar, matching years can help with false positives
    if (aniYear === malYear) {
      return entries[i];
    }
  }
  return null;
};

const getStatus = (status) => {
  // 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching'
  // status. 1/watching, 2/completed, 3/onhold, 4/dropped, 6/plantowatch
  switch (status) {
    case 'watching': return 1;
    case 'completed': return 2;
    case 'on_hold': return 3;
    case 'dropped': return 4;
    case 'plan_to_watch': return 6;
    default: return '';
  }
};

const makeXml = (a) => {
  const xml = `
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
    `.trim().replace(/(\r\n|\n|\r)/gm, '');
  return encodeURIComponent(xml);
};

// Get AniList client credentials
fetch('https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token')
.then(res => res.json())
.then((res) => {
  const token = JSON.parse(res).access_token;
  fetch(`https://anilist.co/api/user/solitethos/animelist?access_token=${token}`)
  .then(aniRes => aniRes.json())
  .then((aniRes) => {
    // console.log(Object.keys(aniRes.lists));
    // [ 'completed', 'plan_to_watch', 'dropped', 'on_hold', 'watching' ]
    const animeList = [
      ...aniRes.lists.completed,
      ...aniRes.lists.plan_to_watch,
      ...aniRes.lists.dropped,
      ...aniRes.lists.on_hold,
      ...aniRes.lists.watching,
    ];

    for (let i = 0; i < 2; i += 1) {
      const anime = animeList[i];
      malSearch(anime.anime.title_romaji)
      .then((mal) => {
        const malMatch = match(anime.anime, mal);
        if (malMatch) {
          console.log('matched', makeXml(anime), malMatch.id);
          malUpdate(malMatch.id[0], makeXml(anime))
          .then(done => console.log(malMatch.id[0], done))
          .catch(err => console.log('err', err));
        }
      });
    }
  });
})
.catch(err => console.log('err', err));
/*
[
  {
        "record_id": 14252747,
        "series_id": 97617,
        "list_status": "plan to watch",
        "score": 0,
        "score_raw": 0,
        "episodes_watched": 0,
        "chapters_read": 0,
        "volumes_read": 0,
        "rewatched": 0,
        "reread": 0,
        "priority": 0,
        "private": 0,
        "hidden_default": 0,
        "notes": null,
        "advanced_rating_scores": [],
        "custom_lists": null,
        "started_on": null,
        "finished_on": null,
        "added_time": "2017-01-20T13:06:28+09:00",
        "updated_time": "2017-01-20T13:06:28+09:00",
        "anime": {
          "id": 97617,
          "title_romaji": "Isekai Shokudou",
          "title_english": "Restaurant to Another World",
          "title_japanese": "異世界食堂",
          "type": "TV",
          "start_date_fuzzy": 20170700,
          "end_date_fuzzy": null,
          "season": 173,
          "series_type": "anime",
]

xml = `
<?xml version="1.0" encoding="UTF-8"?>
<entry>
  <episode>11</episode>
  <status>1</status>
  <score>7</score>
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
  <tags>test tag, 2nd tag</tags>
</entry>
`

$.ajax({
    url: "http://myanimelist.net/api/animelist/add/" + id + ".xml",
    type: "GET",
    data: {"data": myXML},
    username: loginUsername,
    password: loginPassword,
    contentType: "application/xml",
    async: false,
    success: function(ajaxData) {
      console.log("Anime ID " + id + " has been added to " + loginUsername + "'s list!");
    },
    error: function(xhr, status, thrownError) {
      console.log(xhr.status);
    }
  })


*/
