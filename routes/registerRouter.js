const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/', async (req, res) => {
      if (!(req.body.userId && req.body.password)) {
            return res.status(400).json({ message: "Bad request" })
      }

      const db = new AWS.DynamoDB.DocumentClient()

      const userId = req.body.userId
      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      // store to db
      const item = {
            time: new Date().getTime().toString(),
            userId: userId,
            hashedPassword: hashedPassword
      }
      console.log(item)
      var params = {
            'TableName': process.env.PROD_USERS_TABLE_NAME,
            'Item': item
      }

      db.put(params, (err, data) => {
            if (err) {
                  console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2))
                  res.status(500).json(err)
            } else {
                  console.log("Registered user:", JSON.stringify(data, null, 2))

                  // gen jwt
                  // save deets
                  const user = {  // payload for jwt
                        userId: userId
                  }
                  res.status(201).json({ accessToken: jwt.sign(user, process.env.JWT_SECRET_KEY) })
            }
      })
})

// module.exports = router