import nodemailer from 'nodemailer';

// Create reusable transporter using environment variables for security
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER || 'hotelmanagement546@gmail.com',
      pass: process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Generate HTML email template for smart lock PIN code
 */
const generateSmartLockEmailTemplate = (data) => {
  const {
    guestName = 'Guest',
    hotelName,
    roomNumber,
    accessToken,
    backupPin,
    qrCodeUrl,
    checkInDate,
    checkOutDate,
    unlockPageUrl
  } = data;

  const checkInFormatted = new Date(checkInDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const checkOutFormatted = new Date(checkOutDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Smart Room Unlock Access</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 14px;
        }
        .content {
          padding: 30px 20px;
        }
        .booking-details {
          background: #f9fafb;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 13px;
        }
        .detail-value {
          font-weight: 500;
          color: #333;
        }
        .unlock-methods {
          margin: 30px 0;
        }
        .method {
          background: #f0f4ff;
          border: 2px solid #e0e7ff;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        .method-title {
          font-weight: 600;
          color: #667eea;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .qr-code {
          text-align: center;
          margin: 15px 0;
        }
        .qr-code img {
          max-width: 200px;
          height: auto;
          border-radius: 8px;
        }
        .token-box {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          word-break: break-all;
          color: #666;
          margin: 10px 0;
        }
        .pin-display {
          background: #fff8e1;
          border: 2px solid #ffd54f;
          border-radius: 8px;
          padding: 30px;
          text-align: center;
          margin: 20px 0;
        }
        .pin-label {
          font-size: 12px;
          color: #f57c00;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .pin-code {
          font-size: 48px;
          font-weight: bold;
          color: #f57c00;
          letter-spacing: 12px;
          font-family: 'Courier New', monospace;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 15px 0;
          text-align: center;
        }
        .button:hover {
          background: #5568d3;
        }
        .security-features {
          background: #e8f5e9;
          border-left: 4px solid #4caf50;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .security-features h3 {
          margin: 0 0 10px 0;
          color: #2e7d32;
          font-size: 14px;
        }
        .security-features ul {
          margin: 0;
          padding-left: 20px;
        }
        .security-features li {
          margin: 5px 0;
          color: #2e7d32;
          font-size: 13px;
        }
        .expiry-warning {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
          color: #856404;
          font-size: 13px;
        }
        .footer {
          background: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #666;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .pin-code {
            font-size: 36px;
            letter-spacing: 8px;
          }
          .detail-row {
            flex-direction: column;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header -->
        <div class="header">
          <h1>🔑 Smart Room Unlock</h1>
          <p>Your secure access codes for hassle-free check-in</p>
        </div>

        <!-- Content -->
        <div class="content">
          <!-- Welcome -->
          <p>Hi ${guestName},</p>
          <p>We're excited to welcome you to <strong>${hotelName}</strong>! We've generated secure access codes for your room to make your check-in effortless and convenient.</p>

          <!-- Booking Details -->
          <div class="booking-details">
            <div class="detail-row">
              <span class="detail-label">🏨 Room</span>
              <span class="detail-value">${roomNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Check-In</span>
              <span class="detail-value">${checkInFormatted}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">📅 Check-Out</span>
              <span class="detail-value">${checkOutFormatted}</span>
            </div>
          </div>

          <!-- Unlock Methods -->
          <h2 style="color: #333; margin: 30px 0 15px 0;">How to Unlock Your Room</h2>
          
          <div class="unlock-methods">
            <!-- Method 1: QR Code -->
            <div class="method">
              <div class="method-title">📱 Method 1: Scan QR Code (Recommended)</div>
              <p>The easiest way! Scan this QR code with your smartphone to unlock your room instantly.</p>
              ${qrCodeUrl ? `
                <div class="qr-code">
                  <img src="${qrCodeUrl}" alt="Room unlock QR code" />
                </div>
                <p style="text-align: center; margin: 10px 0;">Scan to unlock</p>
              ` : ''}
            </div>

            <!-- Method 2: Access Token -->
            <div class="method">
              <div class="method-title">🔐 Method 2: Use Access Token</div>
              <p>If QR code scanning doesn't work, copy and paste this token on our unlock page:</p>
              <div class="token-box">${accessToken}</div>
              <p style="text-align: center;">
                <a href="${unlockPageUrl}" class="button">Open Unlock Page</a>
              </p>
            </div>

            <!-- Method 3: Backup PIN -->
            <div class="method">
              <div class="method-title">🔑 Method 3: Backup PIN Code (Emergency)</div>
              <p>If digital unlock isn't available, use this PIN code on the smart lock keypad:</p>
              <div class="pin-display">
                <div class="pin-label">Your PIN Code</div>
                <div class="pin-code">${backupPin}</div>
              </div>
              <p style="text-align: center; font-size: 12px; color: #f57c00;">
                <strong>⚠️ Keep this PIN safe and don't share it with anyone except authorized guests.</strong>
              </p>
            </div>
          </div>

          <!-- Security Features -->
          <div class="security-features">
            <h3>🔒 Security Features</h3>
            <ul>
              <li>✓ Unique access codes for your booking only</li>
              <li>✓ Automatic expiration at check-out time</li>
              <li>✓ Multiple backup methods for reliability</li>
              <li>✓ All access attempts logged for your safety</li>
              <li>✓ No need to carry a physical key card</li>
              <li>✓ Works seamlessly with our smart lock system</li>
            </ul>
          </div>

          <!-- Expiry Notice -->
          <div class="expiry-warning">
            <strong>⏰ Access Valid Period:</strong> Your access codes are valid from your check-in time (${checkInFormatted}) and will automatically expire at your check-out time (${checkOutFormatted}).
          </div>

          <!-- Support -->
          <p style="margin-top: 30px; font-size: 14px;">
            <strong>Need Help?</strong> If you have any issues unlocking your room, please contact our front desk immediately. We're here 24/7 to assist you.
          </p>

          <p style="margin-top: 20px;">
            Looking forward to welcoming you!<br/>
            <strong>- The ${hotelName} Team</strong>
          </p>
        </div>

        <!-- Footer -->
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>For support, contact: support@${hotelName.toLowerCase().replace(/\s+/g, '')}.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send smart lock PIN code email to guest
 */
export const sendSmartLockAccessEmail = async (email, data) => {
  try {
    const transporter = createTransporter();

    const htmlContent = generateSmartLockEmailTemplate(data);

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hotelmanagement546@gmail.com',
      to: email,
      subject: `🔑 Smart Room Unlock Access - ${data.hotelName}`,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Smart lock access email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send smart lock access email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

/**
 * Send booking confirmation email (original)
 */
export const sendEmailBooking = async (email, booking) => {
  try {
    const transporter = createTransporter();

    const {
      bookingNumber,
      hotelName,
      roomType,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      currency = '₦',
      bookingStatus = 'confirmed'
    } = booking;

    const isCancelled = bookingStatus?.toLowerCase().includes('cancelled');
    const isConfirmed = bookingStatus?.toLowerCase().includes('confirmed');

    const headerColor = isCancelled ? '#dc2626' : '#1e40af';
    const titleText = isCancelled ? 'Booking Cancelled ❌' : 'Booking Confirmation 🏨';
    const subjectText = isCancelled
      ? `❌ Booking Cancelled - ${hotelName}`
      : `🏨 Booking Confirmation - ${hotelName}`;

    let htmlMessage = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <div style="margin-top: 30px; padding: 15px; background-color: #f9fafb; border-left: 4px solid ${headerColor};">
          <h3 style="margin: 0; color: ${headerColor};">${titleText}</h3>
          ${
            isCancelled
              ? `
              <p style="margin: 10px 0;">We're sorry to inform you that your booking at <strong>${hotelName}</strong> has been cancelled.</p>
              <p style="margin: 10px 0;">If this was a mistake, please contact us to rebook your stay. We hope to welcome you another time.</p>
            `
              : `
              <p style="margin: 10px 0;">We're thrilled to have you stay with us at <strong>${hotelName}</strong>!</p>
              <p style="margin: 10px 0;">Below are the details of your confirmed reservation:</p>
            `
          }
        </div>
      `;

    htmlMessage += `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f3f4f6;">
          <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Detail</th>
          <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">Information</th>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Booking Number</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Hotel</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${hotelName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Room Type</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${roomType}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Check-in</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(checkInDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Check-out</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${new Date(checkOutDate).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Guests</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${numberOfGuests}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Total Price</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${currency} ${totalPrice}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">Status</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${bookingStatus}</td>
        </tr>
      </table>
    `;

    htmlMessage += `
      <p style="margin-top: 20px;">
        ${isCancelled ? 'We hope to serve you in the future.' : 'We look forward to making your stay comfortable and enjoyable.'}
      </p>
      <p style="margin-top: 20px;"><strong>- The Hotel Team</strong></p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'hotelmanagement546@gmail.com',
      to: email,
      subject: subjectText,
      html: htmlMessage,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Booking email sent:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Failed to send booking email:', error);
    throw new Error(`Email send failed: ${error.message}`);
  }
};

export default {
  sendSmartLockAccessEmail,
  sendEmailBooking,
  createTransporter,
  generateSmartLockEmailTemplate
};
