const mongoose= require('mongoose');

const patientReportSchema= mongoose.Schema({
  patientId: {type: String, required: true},
  userId: {type: String, required: true},
  patient: {type: String, required: true},
  fileLocation: {type: String, required: false},
});

const patientReportModel= mongoose.model('PatientReports', patientReportSchema );
module.exports= patientReportModel;