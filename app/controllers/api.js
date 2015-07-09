
/*!
 * Module dependencies.
 */
var battleNetService = require('../services/battleNetService.js');
var mongoose = require('mongoose');
var Compare = mongoose.model('Compare');

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

exports.saveCompare = function (req, res) {
  var compare = new Compare({
    region1: req.params.region1,
    battletag1: req.params.battletag1,
    id1: req.params.id1,
    region2: req.params.region2,
    battletag2: req.params.battletag2,
    id2: req.params.id2
  });
  compare.save(function(err, data){
    res.json(data._id);
  });
}
