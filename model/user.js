var mongoose =  require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
		type 	: String, 
		required: true
	},
    email: {
		type 	: String, 
    required: true,
    unique:true
	},
    password :	{
		type 	: String, 
		required: true, 
		bcrypt  : true
    },
    gender: {
        type: String,
        required: true
    },
    city: String,
    medIssue: String

},{collection : "user"})


exports.UserSchema = mongoose.model('user', UserSchema)