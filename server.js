const express = require('express')
const reportRouter = require('./routes/reportRouter')
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
app.use('/report', reportRouter)
app.use('/login', (req, res) => {
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

      /*
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
      })*/
})
app.use('/register', async (req, res) => {
      if (!(req.body.userId && req.body.password)) {
            return res.status(400).json({ message: "Bad request" })
      }

      const userId = req.body.userId
      const hashedPassword = await bcrypt.hash(req.body.password, 10)

      const user= new User({
            userId:req.body.userId,
            password:hashedPassword,
            time: new Date().getTime().toString()
      });

      user.save().then((data,err)=>{

            if(err){
                  res.status(201).json({
                        message:"Unable to create user"
                  })
            }

            console.log("Registered user:", JSON.stringify(data, null, 2))

            // gen jwt
            // save deets
            const user = {  // payload for jwt
                  userId: userId
            }
            res.status(201).json({ accessToken: jwt.sign(user, process.env.JWT_SECRET_KEY) })
      })
      /*const db = new AWS.DynamoDB.DocumentClient()

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
      })*/
})
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