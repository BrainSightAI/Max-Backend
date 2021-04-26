require('dotenv').config()
const express = require('express')
const router = express.Router()
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const authenticate = require('../middleware/authenticate')

const s3 = new AWS.S3()
const upload = new multer({
      storage: multerS3({
            s3: s3,
            bucket: process.env.PROD_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                  cb(null, Date.now().toString() + "." + file.originalname.toLowerCase().split(" ").join("-"))
            },
      })
})

router.get('/', authenticate, (req, res) => {
      const db = new AWS.DynamoDB.DocumentClient()

      var params = {
            'TableName': process.env.PROD_REPORT_TABLE_NAME
      }

      db.scan(params, (err, data) => {
            if (err) {
                  console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2))
                  res.status(500).json(err)
            } else {
                  console.log(`Got ${data.Count} records`)
                  res.status(200).send(data.Items)
            }
      })
})

router.post('/', authenticate, upload.single('mri'), (req, res) => {
      if (!req.body.patientId) {
            return res.status(400).json({ message: "Bad request" })
      }

      // add nurse ID to the record
      req.body.userId = req.user.userId

      if (req.file) {
            // set url to file
            req.body.fileLocation = req.file.location
      }

      const db = new AWS.DynamoDB.DocumentClient()

      // Uploading object with same patientId will overwrite the existing data object in db
      var params = {
            'TableName': process.env.PROD_REPORT_TABLE_NAME,
            'Item': req.body
      }

      db.put(params, (err, data) => {
            if (err) {
                  console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2))
                  res.status(500).json(err)
            } else {
                  console.log(`Added item: ${req.body.patientId}`)  // change
                  res.status(201).json(req.body)
            }
      })
})

var x = {
      "subjectId": "ABC1234",  // patientId
      "dateOfVisit": "01/01/2020",
      "time": "213213123",
      "informedConsent": "Yes",
      "dob": "12/12/2000",
      "gender": "male",
      "educationalStatus": "d. Completed 10th grade/High School Certificate",
      "socioEconomicalStatus": "iii. Lower Middle (III)",
      "familyType": "d. Broken family",
      "chiefComplaints": [
            {
                  "complaint": "ii. Making mistakes",
                  "duration": "2 months"
            },
            {
                  "complaint": "iii. Difficulty in remembering names",
                  "duration": "3 years"
            }
      ],
      "typeOfOnsetOfIllness": "b. Acute",
      "courseOfIllness": "c. Episodic",
      "progressionOfIllness": "b. Worsening",
      "recordedHistoryOfPresentedIllness": "Yes",
      "recordedNegativeHistory": "Yes",
      "recordedPastHistory": "Yes",
      "recordedFamilyHistory": "No",
      "personalHistory": {
            "sleep": "adequate",
            "appetite": "inadequate",
            "bowelMovements": "regular",
            "bladderDisturbances": "absent",
            "diurnalVariation": "present",
            "treatmentHistory": [
                  {
                        "preparationType": "Syrup",
                        "nameOfMedication": "Test name",
                        "routeOfAdminstration": "P/O",
                        "dosing": "BD",
                        "duration": "2 weeks"
                  },
                  {
                        "preparationType": "Tablet",
                        "nameOfMedication": "Test name 2",
                        "routeOfAdminstration": "IM",
                        "dosing": "TID",
                        "duration": "3 days"
                  },
            ],
            "isPatientPregnant": "No",
            "height": "124 cm",
            "weight": "45 kg",
            "bmi": "2.4 kg/m2",
            "otherPhysicalExamination": "NAD",
      }
}

module.exports = router