require('dotenv').config()
const express = require('express')
const router = express.Router()
const multer = require('multer')
const authenticate = require('../middleware/authenticate')
const PatientReport= require('../models/patientReport')
const MulterAzureStorage = require('multer-azure-blob-storage').MulterAzureStorage;
//const MulterAzureStorage = require('multer-azure-storage')

const yourCustomLogic=(req,file)=>{
      return Date.now().toString() + "." + file.originalname.toLowerCase().split(" ").join("-")
}

const resolveBlobName = (req, file) => {
    return new Promise((resolve, reject) => {
        const blobName = yourCustomLogic(req, file);
        resolve(blobName);
    });
};

const azureStorage = new MulterAzureStorage({
    connectionString: 'DefaultEndpointsProtocol=https;AccountName=vuestorage1;AccountKey=w8hTY+1EWs9ox+NhL2JrM9cl6P129UqVNKmfaRubgveU06VlaIVODdhn1157QyO2nDoeM6stfDcG9UuBGWhGaQ==;EndpointSuffix=core.windows.net',
    accessKey: 'w8hTY+1EWs9ox+NhL2JrM9cl6P129UqVNKmfaRubgveU06VlaIVODdhn1157QyO2nDoeM6stfDcG9UuBGWhGaQ==',
    accountName: 'vuestorage1',
    containerName: 'vue-js-mri',
    blobName: resolveBlobName,
    containerAccessLevel: 'blob',
    urlExpirationTime: 60
});

const upload = multer({
    storage: azureStorage
});


/*var upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: 'DefaultEndpointsProtocol=https;AccountName=vuestorage1;AccountKey=w8hTY+1EWs9ox+NhL2JrM9cl6P129UqVNKmfaRubgveU06VlaIVODdhn1157QyO2nDoeM6stfDcG9UuBGWhGaQ==;EndpointSuffix=core.windows.net',
    containerName: 'vue-js-mri',
    containerSecurity: 'blob'
  })
})*/

/*const s3 = new AWS.S3()
const upload = new multer({
      storage: multerS3({
            s3: s3,
            bucket: process.env.PROD_BUCKET_NAME,
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                  cb(null, Date.now().toString() + "." + file.originalname.toLowerCase().split(" ").join("-"))
            },
      })
})*/

router.get('/', (req, res) => {
      PatientReport.find().then(data=>{
            res.status(200).json(data);
            
      })
})

router.post('/', authenticate,upload.single('fileLocation'), (req, res) => {
      if (!req.body.patientId) {
            return res.status(400).json({ message: "Bad request" })
      }

      let filePath;
      const url= "https://vuestorage1.z13.web.core.windows.net/";
      if(req.file){
            filePath= url+req.file.originalname;
      }
      else{
            filePath=req.body.fileLocation;
      }
      // add nurse ID to the record
      req.body.userId = req.user.userId

      const patientReport= new PatientReport({
            patientId:req.body.patientId,
            userId:req.body.userId,
            patient:req.body.patient,
            fileLocation:filePath
      })

      patientReport.save().then((patientData)=>{
            res.status(200).json(patientData);
      })
})

router.post("/updatePatient",authenticate,upload.single('fileLocation'), (req, res) => {
      if (!req.body.patientId) {
            return res.status(400).json({ message: "Bad request" })
      }

      let filePath;
      const url= "https://vuestorage1.z13.web.core.windows.net/";
      if(req.file){
            filePath= url+req.file.originalname;
      }
      else{
            filePath=req.body.fileLocation;
      }
      // add nurse ID to the record
      req.body.userId = req.user.userId

      PatientReport.updateOne({patientId: req.body.patientId},{
            $set:{
                  patientId:req.body.patientId,
                  userId:req.body.userId,
                  patient:req.body.patient,
                  fileLocation:filePath
            }
      }).then(result=>{
            if(result.n>0){
                  res.status(200).json({
                  message:"Update Successful!"
                  });
            }
            else{
                  res.status(401).json({
                  message:"User is not Authorized"
                  });
            }
            }).catch((err)=>{
                  res.status(500).json({
                        message:err
                  })
            })
})

/*var x = {
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
}*/

module.exports = router