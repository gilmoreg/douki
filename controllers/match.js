/* eslint-disable no-underscore-dangle */
const ToMatch = require('../models/ToMatch');
const IDHash = require('../models/IDHash');

const createMatch = (aniTitle, malID, malTitle) =>
  new Promise(async (resolve) => {
    const match = await ToMatch.create({ aniTitle, malID, malTitle });
    resolve(match);
  });

const commitMatch = (aniTitle, malID) =>
  new Promise(async (resolve) => {
    const match = await ToMatch.findOne({ aniTitle, malID });
    console.log('commit match', match);
    if (match) {
      const hash = await IDHash.create({ aniTitle: match.aniTitle, malID: match.malID });
      console.log('commit created', match);
      if (hash) {
        console.log('removing match', match._id);
        await ToMatch.findByIdAndRemove(match._id);
        resolve(hash);
      }
    }
    // Something went wrong
    resolve(null);
  });

const deleteMatch = (aniTitle, malID) =>
  new Promise(async (resolve) => {
    const match = await ToMatch.findOneAndRemove({ aniTitle, malID });
    resolve(match);
  });

module.exports = {
  add: async (req, res) => {
    const match = await createMatch(req.body.aniTitle, req.body.malID, req.body.malTitle);
    res.status(200).json(match);
  },
  commit: async (req, res) => {
    const match = await commitMatch(req.body.aniTitle, req.body.malID);
    res.status(200).json(match);
  },
  delete: async (req, res) => {
    const match = await deleteMatch(req.body.aniTitle, req.body.malID);
    res.status(200).json(match);
  },
};
