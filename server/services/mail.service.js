require('dotenv').config();
const nodemailer = require('nodemailer');

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) {
        const URL = process.env.PRODUCTION ? process.env.DEPLOY_API_URL : process.env.LOCAL_API_URL;

        await this.transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject: `Активация аккаунта на ${URL}`,
            text: "",
            html:
            `
                <div>
                    <h1>Для активации перейдите по ссылке:</h1>
                    <a href="${link}">${link}</a>
                </div>
            `
        })
    }
}

module.exports = new MailService();