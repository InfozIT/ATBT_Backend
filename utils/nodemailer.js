const nodemailer = require('nodemailer');

transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    tls: {
        servername: 'smtp.gmail.com',
    },
    auth: {
        user: 'nirajkr00024@gmail.com',
        pass: 'fkjj xtju fauu tgai'
    }
});

module.exports = transporter 
