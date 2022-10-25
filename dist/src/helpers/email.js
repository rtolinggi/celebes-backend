"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const constant_1 = require("../configs/constant");
const createTransporter = (email, subject, html) => {
    const transporter = nodemailer_1.default.createTransport({
        host: constant_1.EMAIL_HOST,
        auth: {
            user: constant_1.EMAIL_USER,
            pass: constant_1.EMAIL_PASSWORD,
        },
    });
    const mailOptions = {
        from: constant_1.EMAIL_USER,
        to: email,
        subject: subject,
        html: html,
    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log(info.accepted, info.rejected, info.pending);
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    });
};
const bodyEmail = (link) => {
    return `
    <h1>Verified Email</h1>
    <p><b> Click link Bottom </b></p>
    <a href="${link}">Activate</a>
    `;
};
exports.bodyEmail = bodyEmail;
exports.default = createTransporter;
//# sourceMappingURL=email.js.map