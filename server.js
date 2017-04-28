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

    for (let i = 0; i < 10; i += 1) {
      const anime = animeList[i];
      const title = encodeURIComponent(anime.anime.title_romaji);
      const auth = btoa(`${process.env.MAL_USER}:${process.env.MAL_PW}`);

      fetch(`https://myanimelist.net/api/anime/search.xml?q=${title}`, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`,
        },
        compress: true,
      })
      .then(mal => mal.text())
      .then((mal) => {
        parser.parseString(mal, (err, data) => {
          const aniYear = anime.anime.start_date_fuzzy.toString().substring(0, 4);
          data.anime.entry.forEach((result) => {
            const malYear = result.start_date[0].substring(0, 4);
            if (aniYear === malYear) {
              console.log('match', result.title);
            }
            // console.log(aniYear, malYear);
          });
          // console.log(data.anime.entry.map(entry => entry.title));
          // First 4 digits of start_date_fuzzy is the year, matching those might help
        });
      })
      .catch(err => console.log('err', err));
    }
  });
});
    /* animeList.forEach((anime) => {
      const title = anime.anime.title_romaji;
      fetch(`https://solevul:F1ALf5uocYku@myanimelist.net/api/anime/search.xml?q="${title}"`)
      .then(malRes => JSON.parse(parseString(malRes)))
      .then((malRes) => {
        console.log('malRes', malRes.body);
      });
    });
    const anime = animeList[0];
    const title = encodeURIComponent(anime.anime.title_romaji);
    const username = 'solevul';
    const password = '#3Mal7g#';  */
/*
    const options = {
      host: 'myanimelist.net',
      // path: `api/anime/search.xml?q=naruto`,
      path: 'api/account/verify_credentials.xml',
    };
    request(options.host, options.path)
    .then(response => console.log(response))
    .catch(err => console.log(err));
  });
})
.catch(err => console.log(err));
// https://github.com/cory2067/anisync/blob/master/app/periodic/update.rb

/*
token = https://ytjv79nzl4.execute-api.us-east-1.amazonaws.com/dev/token
https://anilist.co/api/user/solitethos/animelist?access_token=${token}

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
          "synonyms": [
            "Alternate-World Restaurant"
          ],
          "genres": [
            "Comedy",
            "Fantasy",
            "Mystery"
          ],
          "adult": false,
          "average_score": 59.7,
          "popularity": 124,
          "updated_at": 1492581400,
          "image_url_sml": "https://cdn.anilist.co/img/dir/anime/sml/97617-Ec4CCuGbAnhB.jpg",
          "image_url_med": "https://cdn.anilist.co/img/dir/anime/med/97617-Ec4CCuGbAnhB.jpg",
          "image_url_lge": "https://cdn.anilist.co/img/dir/anime/reg/97617-Ec4CCuGbAnhB.jpg",
          "image_url_banner": null,
          "total_episodes": 0,
          "airing_status": "not yet aired"
        }
      }
]


https://myanimelist.net/api/anime/search.xml?q=Gintama°
  <?xml version="1.0" encoding="utf-8"?>
<anime>
    <entry>
        <id>28977</id>
        <title>Gintama°</title>
        <english>Gintama Season 3</english>
        <synonyms>Gintama' (2015)</synonyms>
        <episodes>51</episodes>
        <score>9.24</score>
        <type>TV</type>
        <status>Finished Airing</status>
        <start_date>2015-04-08</start_date>
        <end_date>2016-03-30</end_date>
        <synopsis></synopsis>
        <image>https://myanimelist.cdn-dena.com/images/anime/3/72078.jpg</image>
    </entry>
  Can be multiple entries
</anime>

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
