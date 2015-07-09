
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CompareSchema = new Schema({
  region1: { type: String, default: '' },
  battletag1: { type: String, default: '' },
  id1: { type: String, default: '' },
  region2: { type: String, default: '' },
  battletag2: { type: String, default: '' },
  id2: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

mongoose.model('Compare', CompareSchema);
