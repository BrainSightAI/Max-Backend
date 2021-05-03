const express = require('express')
const reportRouter = require('./routes/reportRouter')
const loginRouter = require('./routes/loginRouter')
const registerRouter = require('./routes/registerRouter')
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

app.use('/', reportRouter)
app.use('/start',(req,res,next)=>{
	res.send("Successfull");
})
app.use('/report', reportRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)

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