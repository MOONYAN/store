var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var accountSchema = new Schema({
    name: { type: String, required: true, unique: true },
    balance: { type: Number, required: true },
    transactions: [{ type: Number, ref: 'Transaction' }],
    messages: [{ type: Number, ref: 'Message' }],
    role: { type: String },
    user: { type: Number, required: true },
    lineId: { type: String }
});

accountSchema.plugin(uniqueValidator);
accountSchema.plugin(autoIncrement.plugin, {
    model: 'Account',
    startAt: 1
});

module.exports = mongoose.model('Account', accountSchema);