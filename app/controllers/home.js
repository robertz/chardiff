
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

exports.compare = function (req, res) {
  var context = {
    title: 'Compare',
    characterA: '',
    characterB: ''
  };
  battleNetService.getCharacter(req.params.battletag1, req.params.id1, function(err, response){
    var charA = {
      layout: false,
      cdata: response
    };
    req.app.render('partials/character-info', charA, function(err, html){
      if(!err) context.characterA = html;
    });
    battleNetService.getCharacter(req.params.battletag2, req.params.id2, function(err, response){
      var charB = {
        layout: false,
        cdata: response
      };
      req.app.render('partials/character-info', charB, function(err, html){
        if(!err) context.characterB = html;
        res.render('home/compare', context);
      });
    });
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
