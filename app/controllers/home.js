
/*!
 * Module dependencies.
 */

var request = require('request');
var battleNetService = require('../services/battleNetService.js');

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Character Differ'
  });
};

exports.start = function (req, res) {
  res.render('home/start', {
    title: 'Select a character to begin'
  });
};

exports.characterInfo = function (req, res) {
  var context = {
    layout: false,
    cdata: {}
  };
  battleNetService.getCharacter(req.params.battletag, req.params.id, function(err, response){
    context.cdata = response;
    res.render('partials/character-info', context);
  });
};
