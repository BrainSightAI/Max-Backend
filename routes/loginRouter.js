const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

router.post('/', (req, res) => {
      const userId = req.body.userId
      const password = req.body.password

      const db = new AWS.DynamoDB.DocumentClient()

      var params = {
            TableName: process.env.PROD_USERS_TABLE_NAME,
            KeyConditionExpression: "#userId = :enteredUserId",
            ExpressionAttributeNames: {
                  "#userId": "userId"
            },
            ExpressionAttributeValues: {
                  ":enteredUserId": userId
            }
      }

      if (!(password && userId)) {
            return res.status(400).json({ message: "Bad request" })
      }

      db.query(params, async (err, data) => {
            if (err) {
                  console.error("Unable to query. Error:", JSON.stringify(err, null, 2))
            } else {
                  if (data.Count === 0) {
                        return res.status(404).json({ message: `No user found with userId=${userId}` })
                  }

                  const item = data.Items[0]
                  const user = {
                        userId: item.userId
                  }
                  try {
                        if (item.userId === userId && await bcrypt.compare(password, item.hashedPassword)) {
                              res.status(200).json({ accessToken: jwt.sign(user, process.env.JWT_SECRET_KEY) })
                        } else {
                              res.status(401).json({ message: "Invalid credentials, try again" })
                        }
                  } catch {
                        res.status(500).json({ message: "Internal server error" })
                  }
            }
      })
})

module.exports = router