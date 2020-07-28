var mongoose = require('mongoose');
var Schema = mongoose.Schema;

commentSchema = new Schema( {
	

	video_id: String,
    comment: String,
    student_id: String,
	student_name: String
	
}),
Comment = mongoose.model('Comments', commentSchema);

module.exports = Comment;