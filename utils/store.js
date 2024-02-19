const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
    destination: './Public/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    }
})

module.exports = upload 