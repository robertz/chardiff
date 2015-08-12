
/*!
 * Module dependencies
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CharacterCacheSchema = new Schema({
  region: { type: String, default: '' },
  battletag: { type: String, default: '' },
  id: { type: String, default: '' },
  data: { type: String, default: '' }
});

mongoose.model('CharacterCache', CharacterCacheSchema);
