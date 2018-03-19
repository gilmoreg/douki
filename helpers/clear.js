const btoa = require('btoa');

const Mal = require('../assets/mal');

global.fetch = require('node-fetch');

const args = process.argv.slice(2);
const [username, password] = args;

if (!username) {
  console.error('You must supply a MAL username as the first argument');
  process.exit(1);
}

if (!password) {
  console.error('You must supply a MAL password as the second argument');
  process.exit(1);
}

const auth = btoa(`${username}:${password}`);

const deleteItem = item =>
  fetch(`https://myanimelist.net/api/${item.type}list/delete/${item.id}.xml`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })
  .then(res => res.text())
  .then(res => console.log(`${item.id}: ${res}`));

Mal.getList(username).then((lists) => {
  Object.keys(lists.anime).forEach(async (key) => {
    await deleteItem(lists.anime[key]);
  });
  Object.keys(lists.manga).forEach(async (key) => {
    await deleteItem(lists.manga[key]);
  });
})
.catch(err => console.error(err));
