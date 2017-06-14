var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var messageSchema = new Schema({
    title: { type: String },
    content: { type: String },
    timeStamp: { type: Date, default: Date.now }
});

messageSchema.plugin(uniqueValidator);
messageSchema.plugin(autoIncrement.plugin, {
    model: 'Message',
    startAt: 1
});

module.exports = mongoose.model('Message', messageSchema);