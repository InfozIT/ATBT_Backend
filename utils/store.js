const multer = require('multer');
const path = require("path");

// const storage = multer.diskStorage({
//     destination: './Public/images',
//     filename: (req, file, cb) => {
//         return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//     }
// })






let upload = multer({
    limits: {
        fileSize: 10000000000000
    }
})

module.exports = upload 





//for S3 Bucket 

// const multer = require('multer');
// const path = require("path");
// const aws = require('aws-sdk');
// const multerS3 = require('multer-s3');

// // Configure AWS SDK with your access credentials
// const s3 = new aws.S3({
//     accessKeyId: 'AKIA2UC3EYJ76535RIXR',
//     secretAccessKey: 'xoNGHqvxYjRq8qU5zKKkycjdf78xi+m/w9Jduzek',
//     region: 'ap-south-1'
// });
// // Create an instance of multerS3 to use S3 storage
// const upload = multer({
//     storage: multerS3({
//         s3: s3,
//         bucket: 'upload-from-node',
//         acl: 'public-read', // Set appropriate permissions
//         metadata: function (req, file, cb) {
//             cb(null, {fieldName: file.fieldname});
//         },
//         key: function (req, file, cb) {
//             // Set the file name in the S3 bucket
//             cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
//         }
//     }),
//     limits: {

//         fileSize: 1000000
//     }
// });

// module.exports = upload;

