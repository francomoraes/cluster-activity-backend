import nodemailer from 'nodemailer';

export const sendVerificationEmail = (email: string, token: string) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or any other email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email',
        text: `Please verify your email by clicking on the following link: 
        ${process.env.BASE_URL}verify-email?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending verification email:', error);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};
