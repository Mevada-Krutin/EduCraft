const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️ SMTP credentials missing or invalid in .env:');
        console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? 'Present' : 'MISSING'}`);
        console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? 'Present' : 'MISSING'}`);
        console.log('-------------------------------------------');
        console.log(`📧 RECIPIENT: ${options.email}`);
        console.log(`📧 SUBJECT: ${options.subject}`);
        console.log(`📧 MESSAGE: ${options.message}`);
        console.log('-------------------------------------------');
        return { success: true, preview: true };
    }

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `"${process.env.FROM_NAME || 'EduCraft'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
};

module.exports = sendEmail;
