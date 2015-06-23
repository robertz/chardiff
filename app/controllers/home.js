
/*!
 * Module dependencies.
 */

var request = require('request');


exports.index = function (req, res) {
  res.render('home/index', {
    title: 'Character Differ'
  });
};

exports.start = function (req, res) {
  res.render('home/start', {
    title: 'Select a character to begin'
  })
}
