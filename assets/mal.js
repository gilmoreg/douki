const config = require('./config');

const Mal = (() => {
  let auth = '';

  return {
    check: (user, pass) =>
      fetch(`${config.ENDPOINT}/mal/check`, {
        method: 'post',
        body: JSON.stringify({ auth: btoa(`${user}:${pass}`) }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      // .then(res => res.json())
      .then((res) => {
        if (res !== 'Invalid credentials') {
          auth = btoa(`${user}:${pass}`);
          return true;
        }
        return false;
      })
      .catch(err => Error(err)),

    add: anilist =>
      fetch(`${config.ENDPOINT}/mal/add`, {
        method: 'post',
        body: JSON.stringify({ auth, anilist }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.json())
      .catch(err => Error(err)),
  };
})();

module.exports = Mal;
