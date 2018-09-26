const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify')


const transport = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
})

const mailOptions = {
    from: 'Комаричев Сергей <komarichev.aw@gmail.com>',
    to: 'komarichev@artwinery.com.ua',
    subject: 'Just trying things out!',
    html: `
    Hey I <strong>Love</strong> Gmail
    `,
    text: 'I ***love*** you!'
}
transport.sendMail(
    mailOptions,
    function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log(info);
        }
    }
)