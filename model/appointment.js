var mongoose =  require('mongoose');

const Schema = mongoose.Schema;
const UserDetail = new Schema({name: String, email: String, phone: Number, city: String, medIssue: String, date: Date})

const AppointmentSchema = new Schema({
    name: {
		type 	: String, 
		required: true
	},
    email: {
		type 	: String, 
		required: true
    },
    appointmentDate: Date,
    approvedList: [UserDetail],
    pendingList: [UserDetail]

},{collection : "appointment"})


exports.AppointmentSchema = mongoose.model('appointment', AppointmentSchema)