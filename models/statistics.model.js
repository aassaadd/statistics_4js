var mongoose = require('mongoose');
/**
 * source模型
 */
var statisticsSchema = new mongoose.Schema(
    {
    key: {type: String, index: true},
    tags:{type:[String], index: true},
    timestamp: {type: Number, index: true},
    times:{type: String, index: true},
    city:{type: String, index: true},
    extra:{type:Object}
    },
    {
      collection: 'statistics',
        id: false
    }
    );

module.exports = mongoose.model('Statistics', statisticsSchema);