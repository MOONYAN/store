var mongoose = require('mongoose'),
    uniqueValidator = require('mongoose-unique-validator'),
    autoIncrement = require('mongoose-auto-increment'),
    Schema = mongoose.Schema;

var productSchema = new Schema({
    name: { type: String },
    price: { type: Number },
    imageUrl: { type: String }
});

productSchema.plugin(uniqueValidator);
productSchema.plugin(autoIncrement.plugin, {
    model: 'Product',
    startAt: 1
});

module.exports = mongoose.model('Product', productSchema);