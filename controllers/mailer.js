/********************* IMPORT MODULES *********************/

const nodemailer = require('nodemailer');

// **********************  SEND EMAIL VERIFICATION *******************************

const mailer = {}

mailer.sendEmail = (jUserData, token, fCallback) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'limeline333@gmail.com', // gmail user
            pass: '*********' // gmail password
        },
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Lime LINE 🍋" <limeline333@gmail.com>', // sender address
        to: jUserData.email, // list of receivers
        subject: 'Welcome to LimeLINE', // Subject line
        html: '<b>You are almost done </b><a href="https://localhost:3443/LIMEline/activate/' + token + '">Click here to activate your account</a>' // html body
    }; // https://www.juliatrefas.net/LIMEline/activate/

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            gLog('err', 'mailer.sendEmail - err  - 30 : ' + err)
            return fCallback(true, {
                status: "error"
            })
        }
        console.log('Message sent: %s', info.messageId);
        return fCallback(false, {
            status: "ok"
        })
    });
}

module.exports = mailer