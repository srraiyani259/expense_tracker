const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    // For production, use environment variables: process.env.EMAIL_HOST, process.env.EMAIL_USER, etc.
    // For now, we try to use a generic service or just log if config is missing.

    // NOTE: Sending real emails requires valid credentials. 
    // If not provided, we will simulate sending by logging to console for development.

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('---------------------------------------------------');
        console.log(`[DEV MODE] Email Simulation:`);
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('---------------------------------------------------');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // or use host/port
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Expense Tracker'} <${process.env.FROM_EMAIL || 'noreply@expensetracker.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
