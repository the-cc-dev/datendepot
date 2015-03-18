'use strict';

var path = require('path');

var express = require('express'),
    requireAll = require('require-all'),
    uuid = require('uuidv4');

var storages = requireAll(path.join(__dirname, 'storage'));

var datendepot = function (options) {
  var middleware,
      storage;

  if (!options) {
    throw new Error('Options is missing.');
  }
  if (!options.storage) {
    throw new Error('Storage is missing.');
  }
  if (!storages[options.storage]) {
    throw new Error('Unknown storage.');
  }

  storage = new storages[options.storage](options.storageOptions);

  middleware = express();

  middleware.get('/:id', function (req, res) {
    storage.get(req.params.id, function (err, stream) {
      if (err) {
        return res.sendStatus(404);
      }
      stream.pipe(res);
    });
  });

  middleware.post('/', function (req, res) {
    var id = uuid();

    storage.put(id, req, function (err) {
      if (err) {
        return res.sendStatus(500);
      }
      res.send(id);
    });
  });

  return middleware;
};

module.exports = datendepot;