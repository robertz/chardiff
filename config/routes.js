
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var home = require('home');
var api = require('api');

/**
 * Expose
 */

module.exports = function (app, passport) {
  // Main routes
  app.get('/', home.index);
  app.get('/start', home.start);

  // Partials
  app.get('/character-info/:battletag/:id', home.characterInfo);
  
  // API related calls
  app.get('/api/account/:id', api.getAccount);

  /**
   * Error handling
   */

  app.use(function (err, req, res, next) {
    // treat as 404
    if (err.message
      && (~err.message.indexOf('not found')
      || (~err.message.indexOf('Cast to ObjectId failed')))) {
      return next();
    }
    console.error(err.stack);
    // error page
    res.status(500).render('500', { error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function (req, res, next) {
    res.status(404).render('404', {
      url: req.originalUrl,
      error: 'Not found'
    });
  });
};
