var request = require('request');
var credentials = require('../../config/credentials');

module.exports = {

  getAccount: function(account, cb){
    request('https://us.api.battle.net/d3/profile/' + account + '/?locale=en_US&apikey=' + credentials.bnetApiKey, function(err, response, body){
      if(!err){
        return cb(null, JSON.parse(body));
      }
    })
  },

  getCharacter: function(account, cb){
    request('https://us.api.battle.net/d3/profile/' + account + '/hero/51865931?locale=en_US&apikey=' + credentials.bnetApiKey, function(err, response, body){
      if(!err){
        cb(JSON.parse(response.body));
      }
      else{
        cb({});
      }
    });
  }

};
