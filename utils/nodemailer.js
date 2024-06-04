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
        user: 'atbt.kapilgroup@gmail.com',
        pass: 'ytgn zzdr tgvm ppoy'
    }
});

module.exports = transporter 
