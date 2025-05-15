import nodemailer from 'nodemailer';

// Map of Mongolian carriers to their email-to-SMS gateway domains
const carriers: Record<string, string> = {
  'mobicom': 'sms.mobicom.mn', 
  'skytel': 'sms.skytel.mn',
  'gmobile': 'sms.gmobile.mn',
  'unitel': 'sms.unitel.mn'
};

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

/**
 * Send SMS using all available methods
 * @param phoneNumber Recipient phone number
 * @param message Message to send
 * @returns Promise that resolves to true if any method succeeded
 */
export async function sendSMS(phoneNumber: string, message: string): Promise<boolean> {
  // Try different methods in order of preference
  return (
    await sendViaEmailToSMS(phoneNumber, message) || 
    await sendViaTextbelt(phoneNumber, message) ||
    await sendViaVonage(phoneNumber, message)
  );
}

/**
 * Send SMS using email-to-SMS gateway
 * @param phoneNumber Recipient phone number
 * @param message Message to send
 * @param carrier Optional carrier name
 * @returns Promise that resolves when the message is sent
 */
async function sendViaEmailToSMS(phoneNumber: string, message: string, carrier?: string): Promise<boolean> {
  try {
    // Skip if no email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email configuration missing, skipping email-to-SMS gateway');
      return false;
    }

    // Remove any non-digit characters from the phone number
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // If specific carrier not provided, try all supported carriers
    const preferredCarrier = process.env.SMS_CARRIER;
    const carriersToTry = carrier 
      ? [carrier] 
      : preferredCarrier && carriers[preferredCarrier]
        ? [preferredCarrier, ...Object.keys(carriers).filter(c => c !== preferredCarrier)]
        : Object.keys(carriers);
    
    let sent = false;
    
    // Try each carrier until message is sent successfully
    for (const carrierName of carriersToTry) {
      if (!carriers[carrierName]) continue;
      
      const emailToSMS = `${cleanNumber}@${carriers[carrierName]}`;
      
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: emailToSMS,
          subject: '', // Subject is usually ignored by SMS gateways
          text: message
        });
        
        console.log(`SMS sent via ${carrierName} to ${phoneNumber}`);
        sent = true;
        break; // Stop after first successful send
      } catch (err) {
        console.error(`Failed to send SMS via ${carrierName}:`, err);
        // Continue to try next carrier
      }
    }

    return sent;
  } catch (error) {
    console.error('Email-to-SMS error:', error);
    return false;
  }
}

/**
 * Send SMS using Textbelt free API (1 free SMS per day)
 * @param phoneNumber Recipient phone number
 * @param message Message to send
 * @returns Promise that resolves to true if SMS was sent
 */
async function sendViaTextbelt(phoneNumber: string, message: string): Promise<boolean> {
  try {
    // Format the number to international format (remove any non-digits)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Use Textbelt's free tier (1 text per day)
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        phone: cleanNumber,
        message: message,
        key: 'textbelt' // 'textbelt' is the free API key
      }).toString()
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`SMS sent via Textbelt to ${phoneNumber} (remaining: ${data.quotaRemaining})`);
      return true;
    } else {
      console.log(`Textbelt error: ${data.error}`);
      return false;
    }
  } catch (error) {
    console.error('Textbelt error:', error);
    return false;
  }
}

/**
 * Send SMS using Vonage (formerly Nexmo) API - needs API key and secret in env
 * @param phoneNumber Recipient phone number
 * @param message Message to send
 * @returns Promise that resolves to true if SMS was sent
 */
async function sendViaVonage(phoneNumber: string, message: string): Promise<boolean> {
  // Skip if no Vonage credentials
  if (!process.env.VONAGE_API_KEY || !process.env.VONAGE_API_SECRET) {
    return false;
  }
  
  try {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    const response = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        api_key: process.env.VONAGE_API_KEY,
        api_secret: process.env.VONAGE_API_SECRET,
        from: 'WeCargo',
        to: cleanNumber,
        text: message
      }).toString()
    });

    const data = await response.json();
    
    if (data.messages?.[0]?.status === '0') {
      console.log(`SMS sent via Vonage to ${phoneNumber}`);
      return true;
    } else {
      console.error('Vonage error:', data);
      return false;
    }
  } catch (error) {
    console.error('Vonage error:', error);
    return false;
  }
}

/**
 * Fallback method to send a verification code via email
 * @param email Recipient email
 * @param code Verification code
 * @returns Promise that resolves when the email is sent
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    // Skip if no email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email configuration missing, skipping verification email');
      return false;
    }
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Нууц үгээ сэргээх код',
      text: `Таны нууц үг сэргээх код: ${code}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4a5568; text-align: center;">Нууц үгээ сэргээх</h2>
          <p style="color: #4a5568;">Сайн байна уу,</p>
          <p style="color: #4a5568;">Таны нууц үг сэргээх код:</p>
          <div style="text-align: center; margin: 20px 0;">
            <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
              ${code}
            </div>
          </div>
          <p style="color: #4a5568;">Энэ код нь 1 цагийн дараа хүчингүй болно.</p>
          <p style="color: #4a5568;">Хэрэв та нууц үгээ сэргээх хүсэлт илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.</p>
        </div>
      `
    });
    
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
} 