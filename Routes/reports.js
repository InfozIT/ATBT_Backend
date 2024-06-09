const express = require('express')
const router = express.Router()
const Reports = require('../Controllers/reports');
const hasPermission = require('../middlewares/rolePermission');

// router.post('/create-user', upload.single('image'), User.Create_User)
router.post('/create-report', Reports.Create_Report)
router.get('/list',  Reports.GetReports)
router.get('/list/:id',  Reports.GetReportByid)
router.delete('/delete/:id', Reports.Delete_Report)


module.exports = router;
