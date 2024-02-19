const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    port: 587,
    host: "smtp.gmail.com",
    secure: false,
    auth: {
        user: 'nirajkr00024@gmail.com',
        pass: 'fkjj xtju fauu tgai'
    }
});

module.exports = transporter 