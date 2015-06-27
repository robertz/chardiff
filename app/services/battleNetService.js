var request = require('request');
var credentials = require('../../config/credentials');

module.exports = {

  getAccount: function(region, account, cb){
    var locale;
    switch(region){
      case 'us':
        locale = 'en_US';
        break;
      case 'eu':
        locale = 'en_GB';
        break;
      default:
        locale = 'en_US';
        break;
    }
    request('https://' + region + '.api.battle.net/d3/profile/' + account + '/?locale=' + locale + '&apikey=' + credentials.bnetApiKey, function(err, response, body){
      if(!err){
        return cb(null, JSON.parse(body));
      }
    });
  },

  getCharacter: function(region, account, id, cb){
    var locale;
    switch(region){
      case 'us':
        locale = 'en_US';
        break;
      case 'eu':
        locale = 'en_GB';
        break;
      default:
        locale = 'en_US';
        break;
    }
    request('https://' + region + '.api.battle.net/d3/profile/' + account + '/hero/' + id + '?locale=' + locale + '&apikey=' + credentials.bnetApiKey, function(err, response, body){
      if(!err){
        return cb(null, JSON.parse(body));
      }
    });
  },

  getItem: function (region, id, cb) {
    var locale;
    switch(region){
      case 'us':
        locale = 'en_US';
        break;
      case 'eu':
        locale = 'en_GB';
        break;
      default:
        locale = 'en_US';
        break;
    }
    request('https://' + region + '.api.battle.net/d3/data/item/' + id + '?locale=' + locale + '&apikey=' + credentials.bnetApiKey, function(err, response, body){
      if(!err){
        return cb(null, JSON.parse(body));
      }
    });
  },

  getItemByTooltip: function (tooltipParams, cb) {
    request('https://us.battle.net/api/d3/data/item/' + tooltipParams, function(err, response, body){
      if(!err){
        cb(null, JSON.parse(body));
      }
    });
  }

};
