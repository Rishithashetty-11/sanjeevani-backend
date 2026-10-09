const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { sendEmail } = require('../utils/email');
const { generateOTP } = require('../utils/otp');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'super_refresh_secret';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'DONOR' },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.otp.create({
      data: { email, otp, type: 'REGISTRATION', expiresAt },
    });

    await sendEmail(email, 'Verify your Sanjeevani Account', `Your OTP is: ${otp}`);

    res.status(201).json({ message: 'User registered. Please check email for OTP.', userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await prisma.otp.findFirst({
      where: { email, otp, type: 'REGISTRATION' },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });

    await prisma.otp.delete({ where: { id: record.id } });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: 'Please verify your email first' });
    }

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    res.status(200).json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Refresh token required' });

    const record = await prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    jwt.verify(token, REFRESH_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' });

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const newRefreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, { expiresIn: '7d' });

      // Replace old refresh token
      await prisma.refreshToken.delete({ where: { id: record.id } });
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: user.id, expiresAt },
      });

      res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: { email, otp, type: 'RESET_PASSWORD', expiresAt },
    });

    await sendEmail(email, 'Reset your Sanjeevani Password', `Your OTP is: ${otp}`);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process forgot password' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await prisma.otp.findFirst({
      where: { email, otp, type: 'RESET_PASSWORD' },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.otp.delete({ where: { id: record.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: record.userId } }); // invalidate old sessions

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

module.exports = {
  register, verifyEmail, login, refreshToken, forgotPassword, resetPassword
};
