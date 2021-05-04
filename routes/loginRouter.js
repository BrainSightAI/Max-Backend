const express = require('express')
const router = express.Router()  
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User= require('../models/user')

router.post('/', (req, res) => {
      const userId = req.body.userId
      const password = req.body.password

      User.findOne({userId:userId}).then(user=>{
            if(!user){
                  return res.status(401).json({message:"Cannot find a User with this Id"});
            }
            return bcrypt.compare(password,user.password);
      }).then(result=>{
            if(!result){
                 return res.status(401).json({ message: "Invalid credentials, try again" });
            }
            const token=jwt.sign({userId:userId},process.env.JWT_SECRET_KEY);
            res.status(200).json({
                  accessToken:token
            })
      }).catch(()=>{
            res.status(201).json({message:"Something went wrong!!"});
      })
})

module.exports = router