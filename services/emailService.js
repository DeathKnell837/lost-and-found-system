/**
 * ============================================================================
 * EMAIL SERVICE (emailService.js)
 * ============================================================================
 * 
 * PURPOSE:
 * This service handles all email notifications in the system.
 * It sends automated emails when certain events occur.
 * 
 * WHEN EMAILS ARE SENT:
 * - Item approved by admin
 * - Item rejected by admin
 * - Claim submitted on user's item
 * - Claim approved/rejected
 * - Potential match found between lost and found items
 * - Email verification for new accounts
 * 
 * TECHNOLOGY USED:
 * - Nodemailer: Node.js library for sending emails
 * - Gmail SMTP: Google's email server (can use other providers)
 * 
 * CONFIGURATION:
 * Email credentials are stored in environment variables:
 * - EMAIL_USER: Gmail address
 * - EMAIL_PASS: Gmail app password (not regular password)
 * 
 * HOW TO SET UP GMAIL:
 * 1. Enable 2-Factor Authentication on Gmail
 * 2. Go to Google Account → Security → App passwords
 * 3. Generate app password for "Mail"
 * 4. Use that password in EMAIL_PASS
 * 
 * ============================================================================
 */

// Import Nodemailer library for sending emails
const nodemailer = require('nodemailer');

/**
 * CREATE EMAIL TRANSPORTER
 * 
 * The transporter is configured to use Gmail's SMTP server.
 * It handles the actual sending of emails.
 * 
 * SMTP = Simple Mail Transfer Protocol
 * This is the standard protocol for sending emails.
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',  // Use Gmail's SMTP configuration
    auth: {
        // Email address to send from (stored in environment variable)
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        // App password (NOT regular Gmail password)
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

/**
 * EMAIL TEMPLATE GENERATOR
 * 
 * Creates a consistent HTML template for all emails.
 * Uses inline CSS for email client compatibility.
 * 
 * @param {String} content - The HTML content for the email body
 * @param {String} title - Email title (shown in browser tab if opened)
 * @returns {String} Complete HTML email template
 */
const getEmailTemplate = (content, title = 'Lost & Found Notification') => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .content h2 { color: #333; margin-top: 0; }
        .item-card { background: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 4px solid #0d6efd; }
        .item-card h3 { margin-top: 0; color: #0d6efd; }
        .btn { display: inline-block; background: #0d6efd; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .btn:hover { background: #0056b3; }
        .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; }
        .status-approved { color: #198754; font-weight: bold; }
        .status-rejected { color: #dc3545; font-weight: bold; }
        .status-claimed { color: #0dcaf0; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Campus Lost & Found</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Campus Lost & Found Management System</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
`;

/**
 * SEND EMAIL FUNCTION
 * 
 * Core function that actually sends the email.
 * All other email functions use this.
 * 
 * @param {String} to - Recipient email address
 * @param {String} subject - Email subject line
 * @param {String} htmlContent - HTML content for email body
 * @returns {Object} Result with success status and message/error
 */
const sendEmail = async (to, subject, htmlContent) => {
    try {
        // Check if email is configured
        // If not configured, log but don't throw error
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email not configured. Skipping email send to:', to);
            console.log('Subject:', subject);
            return { success: false, message: 'Email not configured' };
        }

        // Prepare email options
        const mailOptions = {
            from: `"Campus Lost & Found" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: getEmailTemplate(htmlContent, subject)  // Wrap content in template
        };

        // Send email using transporter
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * SEND ITEM APPROVED EMAIL
 * 
 * Sent when an admin approves a pending item report.
 * Notifies the user that their item is now visible on the platform.
 * 
 * @param {Object} user - User who reported the item
 * @param {Object} item - The approved item
 */
const sendItemApprovedEmail = async (user, item) => {
    const subject = `✅ Your ${item.type} item report has been approved!`;
    const content = `
        <h2>Good News! Your Report is Now Live</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>Your ${item.type} item report has been reviewed and <span class="status-approved">APPROVED</span> by our admin team.</p>
        
        <div class="item-card">
            <h3>${item.itemName}</h3>
            <p><strong>Type:</strong> ${item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}</p>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Date:</strong> ${new Date(item.dateLostFound).toLocaleDateString()}</p>
            <p><strong>Description:</strong> ${item.description}</p>
        </div>
        
        <p>Your item is now visible to everyone on the platform. If someone finds/claims your item, you will be notified.</p>
        
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/items/${item._id}" class="btn">View Your Item</a>
        
        <p>Thank you for using Campus Lost & Found!</p>
    `;
    return sendEmail(user.email, subject, content);
};

/**
 * SEND ITEM REJECTED EMAIL
 * 
 * Sent when an admin rejects a pending item report.
 * Includes the reason for rejection if provided.
 * 
 * @param {Object} user - User who reported the item
 * @param {Object} item - The rejected item
 * @param {String} reason - Reason for rejection (optional)
 */
const sendItemRejectedEmail = async (user, item, reason = '') => {
    const subject = `❌ Your ${item.type} item report was not approved`;
    const content = `
        <h2>Report Review Update</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>Unfortunately, your ${item.type} item report has been <span class="status-rejected">NOT APPROVED</span> by our admin team.</p>
        
        <div class="item-card">
            <h3>${item.itemName}</h3>
            <p><strong>Type:</strong> ${item.type === 'lost' ? '🔴 Lost Item' : '🟢 Found Item'}</p>
            <p><strong>Location:</strong> ${item.location}</p>
        </div>
        
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <p>You can submit a new report with more details or clearer information.</p>
        
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/report/${item.type}" class="btn">Submit New Report</a>
        
        <p>If you believe this was a mistake, please contact our support team.</p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: Item Claimed
const sendItemClaimedEmail = async (user, item, claimerInfo) => {
    const subject = `🎉 Great news! Your ${item.type} item has been claimed!`;
    const content = `
        <h2>Your Item Has Been Claimed!</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>Wonderful news! Your reported item has been <span class="status-claimed">CLAIMED</span>!</p>
        
        <div class="item-card">
            <h3>${item.itemName}</h3>
            <p><strong>Location:</strong> ${item.location}</p>
            <p><strong>Date Reported:</strong> ${new Date(item.dateReported).toLocaleDateString()}</p>
        </div>
        
        <h3>Claimer Information:</h3>
        <p><strong>Name:</strong> ${claimerInfo.name}</p>
        <p><strong>Email:</strong> ${claimerInfo.email}</p>
        ${claimerInfo.phone ? `<p><strong>Phone:</strong> ${claimerInfo.phone}</p>` : ''}
        
        <p>Please coordinate with the claimer to complete the handover.</p>
        
        <p>Thank you for using Campus Lost & Found!</p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: Welcome / Registration
const sendWelcomeEmail = async (user) => {
    const subject = `🎉 Welcome to Campus Lost & Found!`;
    const content = `
        <h2>Welcome, ${user.username}!</h2>
        <p>Thank you for registering with Campus Lost & Found.</p>
        
        <p>With your account, you can now:</p>
        <ul>
            <li>📝 Report lost or found items</li>
            <li>🔍 Search for items across campus</li>
            <li>📊 Track your reported items</li>
            <li>🔔 Receive notifications about your items</li>
        </ul>
        
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/user/dashboard" class="btn">Go to Your Dashboard</a>
        
        <p>If you ever lose something or find an item on campus, we're here to help!</p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: New item match found
const sendMatchFoundEmail = async (user, lostItem, foundItem, matchScore) => {
    const subject = `🔔 Potential match found for your lost item!`;
    const content = `
        <h2>We Found a Potential Match!</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>We found a found item that might match your lost item!</p>
        
        <div class="item-card">
            <h3>Your Lost Item</h3>
            <p><strong>${lostItem.itemName}</strong></p>
            <p>${lostItem.description}</p>
            <p><strong>Location:</strong> ${lostItem.location}</p>
        </div>
        
        <div class="item-card" style="border-left-color: #198754;">
            <h3>Potential Match (${matchScore}% match)</h3>
            <p><strong>${foundItem.itemName}</strong></p>
            <p>${foundItem.description}</p>
            <p><strong>Found at:</strong> ${foundItem.location}</p>
        </div>
        
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/items/${foundItem._id}" class="btn">View Found Item</a>
        
        <p>If this is your item, please contact the finder or submit a claim!</p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: Email Verification
const sendEmailVerificationEmail = async (user, verificationToken) => {
    const verifyUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/verify-email/${verificationToken}`;
    const subject = `📧 Verify your email - Campus Lost & Found`;
    const content = `
        <h2>Verify Your Email Address</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>Thank you for registering with Campus Lost & Found!</p>
        <p>Please click the button below to verify your email address:</p>
        
        <a href="${verifyUrl}" class="btn">Verify Email</a>
        
        <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">${verifyUrl}</p>
        
        <p><strong>This link will expire in 24 hours.</strong></p>
        
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
            If you didn't create an account, please ignore this email.
        </p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: Email Verified Successfully
const sendEmailVerifiedEmail = async (user) => {
    const subject = `✅ Email verified - Welcome to Campus Lost & Found!`;
    const content = `
        <h2>Email Verified Successfully!</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>Your email has been verified. You now have full access to all features!</p>
        
        <p>With your verified account, you can now:</p>
        <ul>
            <li>📝 Report lost or found items</li>
            <li>🔍 Search for items across campus</li>
            <li>💬 Leave comments and tips on items</li>
            <li>📊 Track your reported items</li>
            <li>🔔 Receive notifications about matches</li>
        </ul>
        
        <a href="${process.env.BASE_URL || 'http://localhost:3000'}/user/dashboard" class="btn">Go to Dashboard</a>
        
        <p>Thank you for joining our community!</p>
    `;
    return sendEmail(user.email, subject, content);
};

// Email: Password Reset
const sendPasswordResetEmail = async (user, resetToken) => {
    const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}`;
    const subject = `🔑 Password Reset Request - Campus Lost & Found`;
    const content = `
        <h2>Password Reset Request</h2>
        <p>Hi <strong>${user.username}</strong>,</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to set a new password:</p>
        
        <a href="${resetUrl}" class="btn">Reset Password</a>
        
        <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p style="margin-top: 30px; color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
    `;
    return sendEmail(user.email, subject, content);
};

module.exports = {
    sendEmail,
    sendItemApprovedEmail,
    sendItemRejectedEmail,
    sendItemClaimedEmail,
    sendWelcomeEmail,
    sendMatchFoundEmail,
    sendEmailVerificationEmail,
    sendEmailVerifiedEmail,
    sendPasswordResetEmail
};
