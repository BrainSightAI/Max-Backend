const express = require('express')
const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
      const authHeader = req.headers['authorization']
      const accessToken = authHeader && authHeader.split(' ')[1]

      if (accessToken == null) {
            return res.status(401).send({ message: "No authorization provided" })
      }

      jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, payload) => {
            if (err) {
                  return res.status(403).send({ message: "Invalid authorization token" })
            }
            req.user = payload
            next()
      })
}

module.exports = authenticate