var request = require('request');
var credentials = require('../../config/credentials');

module.exports = {

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
