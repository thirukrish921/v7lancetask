var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	
	
	username: String,
	password: String,
	
}),
User = mongoose.model('User', userSchema);

module.exports = User;