import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApiError } from '@/lib/utils';
import { isResetCodeExpired } from '@/lib/auth-utils';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, resetCode, newPassword } = await request.json();

    if (!phoneNumber || !resetCode || !newPassword) {
      throw new ApiError('Бүх талбарыг бөглөнө үү', 400);
    }

    // Find the user
    const user = await prisma.user.findFirst({
      where: { phoneNumber }
    });

    if (!user) {
      throw new ApiError('Хэрэглэгч олдсонгүй', 404);
    }

    // Check if reset code is valid
    if (user.resetToken !== resetCode) {
      throw new ApiError('Буруу код оруулсан байна', 400);
    }

    // Check if reset code is expired
    if (isResetCodeExpired(user.resetTokenExpiry)) {
      throw new ApiError('Кодны хугацаа дууссан байна. Дахин код авна уу', 400);
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Нууц үг амжилттай шинэчлэгдлээ'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error instanceof ApiError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ success: false, error: 'Нууц үг шинэчлэх үед алдаа гарлаа' }, { status: 500 });
  }
} 