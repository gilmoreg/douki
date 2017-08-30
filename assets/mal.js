/* globals $ */
const Mal = (() => {
  let auth = '';

  return {
    check: (user, pass) => {
      const authCheck = btoa(`${user}:${pass}`);
      const url = `https://us-central1-douki-178418.cloudfunctions.net/mal-proxy/check?auth=${authCheck}`;
      return fetch(url)
        .then(res => res.json())
        .then((res) => {
          if (res.success && res.success.includes('username')) {
            auth = authCheck;
            return true;
          }
          return false;
        })
        .catch(err => Error(err));
    },

    add: anilist =>
      fetch('/mal/add', {
        method: 'post',
        body: JSON.stringify({ auth, anilist }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(res => res.text())
      // Strip off leading and tailing double quotes
      .then(text => text.replace(/"/g, ''))
      .catch(err => Error(err)),
  };
})();

module.exports = Mal;
