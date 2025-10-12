import colors from 'colors';
import nodemailer from 'nodemailer';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';
import { config } from '../config';

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.smtp.username,
    pass: config.smtp.password,
  },
});

// Verify transporter connection
if (config.environment !== 'test') {
  transporter
    .verify()
    .then(() => logger.info(colors.cyan('📧  Connected to email server')))
    .catch(err =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

// Function to send email
const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `${config.smtp.emailFrom}`, // sender address
      to: values.to, // list of receivers
      subject: values.subject, // subject line
      html: values.html, // html body
    });
    logger.info('Mail sent successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

const sendVerificationEmail = async (to: string, otp: string) => {
  const subject = 'Verify Your Email Address';
  const html = `
    <div style="width: 45% ; margin: 0 auto ;font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Logo" style="width: 200px; margin-bottom: 20px;" />
        <h1 style="color: #1B9AAA;">Email Verification</h1>
        <p style="font-size: 16px;">Thank you for signing up! Please verify your email address to complete the registration process. If you did not create an account with us, please disregard this email.</p>
      </div>
      <div style="text-align: center;">
        <h2 style="background-color: #f4f4f4; padding: 10px 20px; display: inline-block; border-radius: 5px; color: #1B9AAA; font-size: 35px;">${otp}</h2>
      </div>
      <p style="font-size: 14px; text-align: center; margin-top: 20px;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
};

const sendResetPasswordEmail = async (to: string, otp: string) => {
  const subject = 'Reset Your Password';
  const html = `
   <div style="width: 45% ; margin: 0 auto ;font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Logo" style="width: 200px; margin-bottom: 20px;" />
        <h1 style="color: #1B9AAA;">Password Reset Request</h1>
        <p style="font-size: 16px;">We received a request to reset your password. Use the code below to proceed with resetting your password:</p>
      </div>
      <div style="text-align: center;">
        <h2 style="background-color: #f4f4f4; padding: 10px 20px; display: inline-block; border-radius: 5px; color: #1B9AAA; font-size: 35px;">${otp}</h2>
      </div>
      <p style="font-size: 14px; text-align: center; margin-top: 20px;">This code is valid for 10 minutes. If you did not request a password reset, please disregard this email and contact support if needed.</p>
    </div>
  `;

  await sendEmail({ to, subject, html });
};

const sendAdminOrSuperAdminCreationEmail = async (
  email: string,
  role: string,
  password: string,
  message?: string // Optional custom message
) => {
  const subject = `Congratulations! You are now an ${role}`;
  const html = `
    <div style="width: 45%; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Logo" style="width: 200px; margin-bottom: 20px;" />
        <h1 style="color: #1B9AAA;">Congratulations! You are now an ${role}</h1>
        <p style="font-size: 16px;">You have been granted ${role} access to the system. Use the credentials below to log in:</p>
      </div>
      <div style="text-align: center;">
        <p style="font-size: 16px; font-weight: bold;">Email: <span style="color: #1B9AAA;">${email}</span></p>
        <p style="font-size: 16px; font-weight: bold;">Temporary Password: <span style="color: #1B9AAA;">${password}</span></p>
      </div>
      
      ${
        message
          ? `<div style="margin-top: 20px; padding: 15px; background-color: #f4f4f4; border-radius: 10px;">
              <p style="font-size: 14px; text-align: center; color: #555;">${message}</p>
            </div>`
          : ''
      }

      <p style="font-size: 14px; text-align: center; margin-top: 20px;">For security reasons, please log in and change your password immediately.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};
// Function to send a Welcome Email
const sendWelcomeEmail = async (to: string, password: string) => {
  const subject = 'Welcome to the Platform!';
  const html = `
    <div style="width: 45%; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Logo" style="width: 200px; margin-bottom: 20px;" />
        <h1 style="color: #1B9AAA;">Welcome to the Platform!</h1>
        <p style="font-size: 16px;">We are excited to have you join us. Your account has been created successfully. Use the following credentials to log in:</p>
      </div>
      <div style="text-align: center;">
        <p style="font-size: 16px; font-weight: bold;">Email: <span style="color: #1B9AAA;">${to}</span></p>
        <p style="font-size: 16px; font-weight: bold;">Temporary Password: <span style="color: #1B9AAA;">${password}</span></p>
      </div>
      <p style="font-size: 14px; text-align: center; margin-top: 20px;">For security reasons, please log in and change your password immediately.</p>
    </div>
  `;
  await sendEmail({ to, subject, html });
};
const sendSupportMessageEmail = async (
  userEmail: string,
  userName: string,
  subject: string,
  message: string
) => {
  const adminEmail = config.smtp.emailFrom; // Admin email from config
  const html = `
    <div style="width: 45%; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #ccc; border-radius: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Logo" style="width: 200px; margin-bottom: 20px;" />
        <h1 style="color: #1B9AAA;">New Support Message</h1>
        <p style="font-size: 16px;"><strong>From:</strong> ${userName} (${userEmail})</p>
        <p style="font-size: 16px;"><strong>Subject:</strong> ${subject}</p>
        <p style="font-size: 16px;">${message}</p>
      </div>
      <p style="font-size: 14px; text-align: center; margin-top: 20px;">Please respond to the user as soon as possible.</p>
    </div>
  `;

  await sendEmail({
    to: adminEmail || '',
    subject: `Support Request from ${userName}`,
    html,
  });
};


export const paymentSuccessTemplate = (
  planName: string,
  amount: number,
  currency: string
) => `
  <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 20px; border-radius: 10px;">
    <div style="max-width: 500px; margin: auto; background: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color: #4CAF50; text-align: center;">🎉 Payment Successful!</h2>
      <p style="font-size: 16px; color: #333;">Hello,</p>
      <p style="font-size: 16px; color: #333;">
        Your payment for the plan <strong style="color:#4CAF50;">${planName}</strong> was successful.
      </p>
      <div style="margin: 20px 0; padding: 15px; background: #f1fdf4; border: 1px solid #c8e6c9; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2e7d32;">
          💳 Amount Paid: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}
        </p>
      </div>
      <p style="font-size: 14px; color: #555;">
        Thank you for choosing our service. You now have full access to your plan features.
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #888; text-align: center;">
        If you have any questions, feel free to <a href="mailto:support@yourapp.com" style="color:#4CAF50;">contact our support</a>.
      </p>
    </div>
  </div>
`;

const sendPaymentInvoiceEmail = async (
  to: string,
  userName: string,
  transactionId: string,
  planName: string,
  amount: number,
  discountApplied: boolean,
  discountAmount: number = 0,
  paymentDate: Date
) => {
  const subject = 'Payment Invoice - Lomi Dating App';
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(paymentDate);

  const html = `
    <div style="width: 600px; margin: 0 auto; font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #e0e0e0; border-radius: 10px; background: #ffffff;">
      <div style="text-align: center; border-bottom: 2px solid #1B9AAA; padding-bottom: 20px; margin-bottom: 30px;">
        <img src="https://raw.githubusercontent.com/rakibislam2233/Image-Server/refs/heads/main/mentor-services.png" alt="Lomi Logo" style="width: 180px; margin-bottom: 15px;" />
        <h1 style="color: #1B9AAA; margin: 10px 0;">Payment Invoice</h1>
      </div>

      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #333; margin-top: 0; font-size: 20px;">Hello ${userName},</h2>
        <p style="font-size: 16px; line-height: 1.6; margin: 10px 0;">
          Thank you for your payment! This email serves as your official invoice for the subscription purchase.
        </p>
      </div>

      <div style="background: #fff; padding: 25px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 25px;">
        <h3 style="color: #1B9AAA; margin-top: 0; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Invoice Details</h3>

        <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
          <tr style="height: 40px;">
            <td style="font-weight: bold; color: #666; padding: 8px 0;">Transaction ID:</td>
            <td style="color: #333; text-align: right; padding: 8px 0;">${transactionId}</td>
          </tr>
          <tr style="height: 40px; background: #f8f9fa;">
            <td style="font-weight: bold; color: #666; padding: 8px 10px;">Payment Date:</td>
            <td style="color: #333; text-align: right; padding: 8px 10px;">${formattedDate}</td>
          </tr>
          <tr style="height: 40px;">
            <td style="font-weight: bold; color: #666; padding: 8px 0;">Plan Name:</td>
            <td style="color: #333; text-align: right; padding: 8px 0;">${planName}</td>
          </tr>
          ${discountApplied ? `
          <tr style="height: 40px; background: #f8f9fa;">
            <td style="font-weight: bold; color: #666; padding: 8px 10px;">Original Price:</td>
            <td style="color: #999; text-align: right; padding: 8px 10px; text-decoration: line-through;">$${(amount + discountAmount).toFixed(2)}</td>
          </tr>
          <tr style="height: 40px;">
            <td style="font-weight: bold; color: #666; padding: 8px 0;">Discount Applied:</td>
            <td style="color: #4CAF50; text-align: right; padding: 8px 0;">-$${discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr style="height: 50px; border-top: 2px solid #1B9AAA; margin-top: 10px;">
            <td style="font-weight: bold; color: #1B9AAA; font-size: 18px; padding: 15px 0;">Total Amount Paid:</td>
            <td style="color: #1B9AAA; text-align: right; font-size: 20px; font-weight: bold; padding: 15px 0;">$${amount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
        <p style="margin: 0; font-size: 16px; color: #2e7d32;">
          <strong>Payment Status:</strong> <span style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; margin-left: 10px;">SUCCESSFUL</span>
        </p>
      </div>

      <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <p style="font-size: 14px; color: #666; margin: 10px 0;">
          This is an auto-generated invoice. Please keep it for your records.
        </p>
        <p style="font-size: 14px; color: #666; margin: 10px 0;">
          If you have any questions about this payment, please contact our support team.
        </p>
        <a href="mailto:support@lomidatingapp.com" style="display: inline-block; margin-top: 15px; padding: 10px 30px; background: #1B9AAA; color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">Contact Support</a>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center;">
        <p style="font-size: 12px; color: #999;">
          © ${new Date().getFullYear()} Lomi Dating App. All rights reserved.
        </p>
        <p style="font-size: 12px; color: #999; margin-top: 5px;">
          This email was sent to ${to}
        </p>
      </div>
    </div>
  `;

  await sendEmail({ to, subject, html });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAdminOrSuperAdminCreationEmail,
  sendSupportMessageEmail,
  sendWelcomeEmail,
  sendPaymentInvoiceEmail,
};
