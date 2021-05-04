const express = require('express')
const reportRouter = require('./routes/reportRouter')
const registerRouter = require('./routes/registerRouter')
const loginRouter = require('./routes/loginRouter')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User= require('./models/user')
const cors = require('cors')
const bodyParser= require('body-parser');
var mongoose = require('mongoose');
require('dotenv').config();

const app = express()

mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb", {
	auth: {
		user: process.env.COSMOSDB_USER,
		password: process.env.COSMOSDB_PASSWORD
	},
	useNewUrlParser: true,
	useUnifiedTopology: true,
	retryWrites: false
})
.then(() => console.log('Connection to CosmosDB successful'))
.catch((err) => console.error(err));

//app.use(express.json())
app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use('/report', reportRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

var port= process.env.PORT||3000;
app.listen(port, () => {
	console.log(`Started listening on ${port}`)
})

/**
 * DEV:
 *
 * change table name
 * change var awsCreds
 * change patientId, id
 */