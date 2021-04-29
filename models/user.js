const mongoose= require('mongoose');

const userSchema= mongoose.Schema({
  userId: {type: String, required: true},
  password: {type: String, required: true},
  time: {type: String, required: true}
});

const userModel= mongoose.model('Users', userSchema );
module.exports= userModel;