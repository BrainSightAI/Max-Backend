const express = require('express')
const reportRouter = require('./routes/reportRouter')
const loginRouter = require('./routes/loginRouter')
// const registerRouter = require('./routes/registerRouter')
const AWS = require('aws-sdk')
const cors = require('cors')
const bodyParser= require('body-parser');
require('dotenv').config()

const app = express()

//app.use(express.json())
app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/', reportRouter)
app.use('/report', reportRouter)
app.use('/login', loginRouter)
// app.use('/register', registerRouter)

const awsCreds = {
	accessKeyId: "AKIA23CQD767QOSYM26S",
	secretAccessKey: "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",
	region: "us-east-2",
	// endpoint: "http://dynamodb.us-east-2.amazonaws.com"
}
AWS.config.update(awsCreds)

app.listen(process.env.PORT, () => {
	console.log(`Started listening on ${process.env.PORT}`)
})

/**
 * DEV:
 *
 * change table name
 * change var awsCreds
 * change patientId, id
 */