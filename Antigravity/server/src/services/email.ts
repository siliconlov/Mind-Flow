
import nodemailer from 'nodemailer';

// Configure Transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendWelcomeEmail = async (to: string, name: string) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not set. Skipping welcome email.');
        return;
    }

    const mailOptions = {
        from: `"MindFlow AI" <${process.env.EMAIL_USER}>`,
        to,
        subject: 'Welcome to MindFlow - Your Second Brain 🧠',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #6366f1; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0;">Welcome to MindFlow!</h1>
                </div>
                <div style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 0 0 10px 10px;">
                    <p>Hi <strong>${name}</strong>,</p>
                    <p>We're thrilled to have you onboard! MindFlow is designed to help you organize your thoughts, connect ideas, and think clearly.</p>
                    
                    <h3>🚀 What you can do next:</h3>
                    <ul>
                        <li><strong>Create a Note:</strong> Capture your first idea.</li>
                        <li><strong>Ask the AI:</strong> Chat with your "Second Brain" to brainstorm or summarize.</li>
                        <li><strong>Visualize:</strong> Switch to Graph View to see how your ideas connect.</li>
                    </ul>

                    <p style="margin-top: 30px;">Happy Thinking,</p>
                    <p><strong>The MindFlow Team</strong></p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};
