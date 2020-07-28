var mongoose = require('mongoose');
var Schema = mongoose.Schema;

studentSchema = new Schema( {
	
	
	
    username: String,
    class: String,
	password: String,
	
}),
Student = mongoose.model('Stud', studentSchema);

module.exports = Student;