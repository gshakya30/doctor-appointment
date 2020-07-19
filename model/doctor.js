var mongoose =  require('mongoose');

const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
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
        type: String
    },
    phone: Number,
    city: String,
    specialization: String,
    filePath:String

},{collection : "doctor"})

DoctorSchema.index({specialization:'text'});



exports.DoctorSchema = mongoose.model('doctor', DoctorSchema)