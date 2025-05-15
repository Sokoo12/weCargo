import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/utils';
import { generateRandomCode } from '@/lib/auth-utils';
import { sendSMS, sendVerificationEmail } from '@/lib/sms-service';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      throw new ApiError('Утасны дугаар оруулна уу', 400);
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      // For security reasons, don't reveal whether a user with this phone number exists
      return NextResponse.json({ 
        success: true, 
        message: 'Хэрэв энэ дугаар бүртгэлтэй бол нууц үг сэргээх код илгээгдэх болно'
      });
    }

    // Generate a 6-digit code
    const resetToken = generateRandomCode(6);
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Code expires in 1 hour

    // Store the reset code in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // Try to send the code via SMS using our email-to-SMS gateway
    const smsMessage = `WeCargo: Таны нууц үг сэргээх код: ${resetToken}`;
    const smsSent = await sendSMS(phoneNumber, smsMessage);
    
    // If SMS fails and user has email, try sending via email as fallback
    let emailSent = false;
    if (!smsSent && user.email) {
      emailSent = await sendVerificationEmail(user.email, resetToken);
    }

    // In development mode, log the code to console for testing
    if (process.env.NODE_ENV === 'development') {
      console.log(`Reset code for ${phoneNumber}: ${resetToken}`);
    }

    const message = smsSent 
      ? 'Нууц үг сэргээх код таны утас руу илгээгдлээ'
      : emailSent
        ? 'Нууц үг сэргээх код таны имэйл рүү илгээгдлээ'
        : 'Нууц үг сэргээх код үүсгэгдлээ';

    return NextResponse.json({ 
      success: true, 
      message,
      // Only return the code in development mode for testing
      ...(process.env.NODE_ENV === 'development' && { code: resetToken }),
      sentViaSMS: smsSent,
      sentViaEmail: emailSent
    });
  } catch (error) {
    console.error('Request reset error:', error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: 'Хүсэлтийг боловсруулах үед алдаа гарлаа' }, { status: 500 });
  }
} 