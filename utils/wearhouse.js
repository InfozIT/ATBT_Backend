const dotenv = require("dotenv");
dotenv.config();
const AWS = require("aws-sdk");
// const uuid = require("uuid").v4;
var db = require('../models/index');






const awsConfig = {
  accessKeyId: process.env.AccessKey,
  secretAccessKey: process.env.SecretKey,
  region: process.env.region,
};

const S3 = new AWS.S3(awsConfig);


const uploadToS3 = async (fileData) => {

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      // Key: `${uuid()}-${fileData.originalname}`,
      Key: `${fileData.originalname}`,
      Body: fileData.buffer,
    };
    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      console.log(data);
      return resolve(data);
    });
  });

};
const uploadToS4 = async (fileData, filebody) => {
  let Query = filebody;

  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${fileData.originalname}`,
      Body: fileData.buffer,
    };

    S3.upload(params, async (err, data) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      const MeetingId = Query?.meeting ?? null;
      const TaskId = Query?.task ?? null;
      if(MeetingId){
        try {
          let loc = `"${data.Location}"`
          await db.Attachments.create({
            Attachments: loc,
            MeetingId: MeetingId
          });
          resolve(data);
        } catch (dbErr) {
          console.log(dbErr);
          reject(dbErr);
        }
      }
      if(TaskId){
        try {
          let loc = `"${data.Location}"`
          await db.Attachments.create({
            Attachments: loc,
            TaskId: TaskId
          });
          resolve(data);
        } catch (dbErr) {
          console.log(dbErr);
          reject(dbErr);
        }
      }
    });
  });
};



module.exports = { uploadToS3, uploadToS4 }
