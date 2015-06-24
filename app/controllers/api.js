
/*!
 * Module dependencies.
 */

var battleNetService = require('../services/battleNetService.js');

exports.getAccount = function (req, res) {
  battleNetService.getAccount(req.params.region, req.params.id, function(err, response){
    res.json(response);
  });
};
