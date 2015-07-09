
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
  app.get('/compare/:region1/:battletag1/:id1/to/:region2/:battletag2/:id2', home.compare);

  // Partials
  app.get('/character-info/:region/:battletag/:id', home.characterInfo);
  app.get('/item-info/:region/:id', home.itemInfo);
  app.get('/tooltip/item/:tooltipParams', home.tooltip);

  // API related calls
  app.get('/api/account/:region/:id', api.getAccount);
  app.get('/api/item/:region/:id', api.getItem);

  // Save to recently compared
  app.get('/api/compare/:region1/:battletag1/:id1/:region2/:battletag2/:id2', api.saveCompare);

  app.get('/api/data/item/:tooltipParam', api.getItemByTooltip);

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
