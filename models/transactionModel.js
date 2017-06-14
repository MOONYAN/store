var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var transactionSchema = new Schema({
    amount: { type: Number },
    balance: { type: Number },
    type: { type: String },
    product: { type: Number, ref: 'Product' },
    timeStamp: { type: Date, default: Date.now }
});

transactionSchema.plugin(uniqueValidator);
transactionSchema.plugin(autoIncrement.plugin, {
    model: 'Transaction',
    startAt: 1
});

module.exports = mongoose.model('Transaction', transactionSchema);