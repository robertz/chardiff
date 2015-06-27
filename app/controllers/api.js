
/*!
 * Module dependencies.
 */

var battleNetService = require('../services/battleNetService.js');

exports.getAccount = function (req, res) {
  battleNetService.getAccount(req.params.region, req.params.id, function(err, response){
    res.json(response);
  });
};

exports.getItem = function (req, res) {
  battleNetService.getItem(req.params.region, req.params.id, function(err, response){
    res.json(response);
  });
};

exports.getItemByTooltip = function (req, res) {
  battleNetService.getItemByTooltip(req.params.tooltipParam, function(err, response){
    res.json(response);
  });
};
