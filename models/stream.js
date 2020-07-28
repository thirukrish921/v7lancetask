var mongoose = require('mongoose');
var Schema = mongoose.Schema;

streamSchema = new Schema( {
	
	
	trainee_id: String,
    trainee_name: String,
    stream_url: String,
	class: String
}),
Stream = mongoose.model('Stream', streamSchema);

module.exports = Stream;