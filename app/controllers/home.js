
/*!
 * Module dependencies.
 */

var request = require('request');


exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Character Differ'
  });
};
