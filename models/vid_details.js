var mongoose = require('mongoose');
var Schema = mongoose.Schema;

detailsSchema = new Schema( {
	
	
	name: String,
    description: String,
    upload_by: String,
	can_view_by: String
}),
Detail = mongoose.model('Detail', detailsSchema);

module.exports = Detail;