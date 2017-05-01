/* eslint-disable no-unused-vars */
const fetch = require('node-fetch');
const btoa = require('btoa');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();

module.exports = {
  search: (credentials, title) =>
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
          resolve(data);
        });
      })
      .catch(err => reject(err));
    }),
  add: (credentials, id, xml) =>
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
    }),
};
