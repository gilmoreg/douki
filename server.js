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
