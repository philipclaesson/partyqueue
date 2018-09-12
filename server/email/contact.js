var express = require('express');
var emailRouter = express.Router();

app.post('/contact/:type', function (req, res) {
  type = req.params.type
  console.log(req.body)
  console.log("asd")

  if ((req.body.email.length > 0) && (type === "cta" || type === "message")){
    if (type === "cta"){
      var mailOptions = {
        from: 'philip@klimato.se',
        to: 'philip@klimato.se',
        replyTo: req.body.email,
        subject: 'Kontaktförfrågan från ' + req.body.email,
        text: 'Klimato har fått en kontaktförfrågan från ' + req.body.email
      };
    } else { // (type == "message")
      var mailOptions = {
        from: 'philip@klimato.se',
        to: 'philip@klimato.se',
        replyTo: req.body.email,
        subject: 'Meddelande från ' + req.body.name,
        text: "Meddelande från " + req.body.name + " (" + req.body.email + ") via formulär på Klimato.se. \n Meddelande: " + req.body.text
      };
  }

  var transporter = nodemailer.createTransport({
    host: 'email-smtp.eu-west-1.amazonaws.com',
    port: 587,
    secure: false,
    auth: {
      user: 'AKIAJCDTXBRNNZC7RNIA',
      pass: 'AgrQ9LjplqmQVJjkaEPbJVMfbidCiyI1Has7aaXpq8Br'
    }
  });

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent!');
    }
  });
  res.end("Success")

  } else {
      // do something
    res.status(500).send('Bad email request. ')
  }
})

module.exports = emailRouter