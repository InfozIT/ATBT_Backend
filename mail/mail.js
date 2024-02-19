const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

router.post('/send-email', (req, res) => {
  var send_to = req.query.email;
  const { to, subject, text, html } = req.body;

  const transporter = nodemailer.createTransport({
    port: 587,
    host: "smtp.gmail.com",
    secure: false,
    auth: {
      user: 'nirajkr00024@gmail.com',
      pass: 'fkjj xtju fauu tgai'
    }
  });

  const mailData = {
    from: 'nirajkr00024@gmail.com',
    to: send_to,
    subject: subject || 'Sending Email using Node.js',
    text: text || 'That was easy!',
    html: html || '<b>Hey there! </b><br>This is our first message sent with Nodemailer<br/>',
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err)
      res.status(500).json({ error: err.message });
    else
      // res.json({ message: 'Email sent successfully! ${send_to}', info: info });
      res.json({ message: `mail send to you repected mail ${send_to}` });
  });
});

module.exports = router;

