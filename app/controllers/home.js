
/*!
 * Module dependencies.
 */

var request = require('request');
var battleNetService = require('../services/battleNetService.js');
var mongoose = require('mongoose');
var CharacterCache = mongoose.model('CharacterCache');

mapCharacterData = function (data) {
  if(typeof data.id === 'undefined') return data;

  var res = {
    id: data.id,
    name: data.name,
    class: data.class,
    level: data.level,
    paragonLevel: data.paragonLevel,
    skills: data.skills,
    items: {
      Head: data.items.head,
      Neck: data.items.neck,
      Shoulders: data.items.shoulders,
      Torso: data.items.torso,
      Bracers: data.items.bracers,
      Hands: data.items.hands,
      LeftFinger: data.items.leftFinger,
      RightFinger: data.items.rightFinger,
      Waist: data.items.waist,
      Legs: data.items.legs,
      Feet: data.items.feet,
      MainHand: data.items.mainHand,
      OffHand: data.items.offHand
    },
    stats: {
      life: data.stats.life,
      damage: data.stats.damage.toFixed(0),
      toughness: data.stats.toughness.toFixed(0),
      healing: data.stats.healing.toFixed(0),
      attackSpeed: data.stats.attackSpeed.toFixed(2),
      armor: data.stats.armor.toFixed(0),
      strength: data.stats.strength,
      dexterity: data.stats.dexterity,
      vitality: data.stats.vitality,
      intelligence: data.stats.intelligence,
      lifeOnHit: data.stats.lifeOnHit
    },
    kills: data.kills
  };
  return res;
};

exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Compare two Diablo 3 characters'
  });
};

exports.start = function (req, res) {
  res.render('home/start', {
    title: 'Select a character to begin'
  });
};

exports.compare = function (req, res) {
  var context = {
    title: 'Compare ',
    region: req.params.region1,
    characterA: '',
    characterB: ''
  };
  battleNetService.getCharacter(req.params.region1, req.params.battletag1, req.params.id1, function(err, response){
    var charA = {
      layout: false,
      cdata: mapCharacterData(response)
    };
    req.app.render('partials/character-info', charA, function(err, html){
      if(!err){
        context.characterA = html;
        context.title += charA.cdata.name + ' ';
      }
    });
    battleNetService.getCharacter(req.params.region2, req.params.battletag2, req.params.id2, function(err, response){
      var charB = {
        layout: false,
        cdata: mapCharacterData(response)
      };
      req.app.render('partials/character-info', charB, function(err, html){
        if(!err){
          context.characterB = html;
          context.title += 'to ' + charB.cdata.name;
        }
        res.render('home/compare', context);
      });
    });
  });
};

exports.characterInfo = function (req, res) {
  var context = {
    layout: false,
    region: req.params.region,
    cdata: {}
  };
  battleNetService.getCharacter(req.params.region, req.params.battletag, req.params.id, function(err, response){
    var characterCache = new CharacterCache({
      region: req.params.region,
      battletag: req.params.battletag,
      id: req.params.id,
      data: JSON.stringify(response)
    });

    CharacterCache.findOneAndUpdate(
      { region: req.params.region, battletag: req.params.battletag, id: req.params.id },
      {$set: {data: JSON.stringify(response)}},
      {upsert: true},
      function(err, res){
       console.dir(err);
       console.dir(res);
      }
    );


    // CharacterCache.findAndModify({
    //   query: { region: req.params.region, battletag: req.params.battletag, id: req.params.id },
    //   update: {
    //     $setOnInsert: { data: JSON.stringify(response)}
    //   },
    //   new: true,
    //   upsert: true
    // });
    context.cdata = mapCharacterData(response);
    res.render('partials/character-info', context);
  });
};

exports.itemInfo = function (req, res) {
  var context = {
    layout: false,
    region: req.params.region,
    idata: {}
  };
  battleNetService.getItem(req.params.region, req.params.id, function(err, response){
    context.idata = response;
    res.render('partials/item-info', context);
  });
};

exports.tooltip = function (req, res) {
  var context = {
    layout: false,
    idata: {}
  };
  battleNetService.getItemByTooltip(req.params.tooltipParams, function(err, response){
    context.idata = response;
    res.render('partials/tooltip', context);
  });
};
