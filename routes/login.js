const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const express = require('express');
const verifier = express.Router();
require('dotenv').config();
const pool = require('../config/database'); // PostgreSQL 클라이언트 가져오기

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  service: 'gmail', // 예시로 Gmail 사용, 필요시 다른 서비스 사용 가능
  auth: {
    user: 'dogun929@gmail.com',
    pass: 'vipp lxdo hzuz ntph', // Gmail의 경우 앱 비밀번호 사용 필요
  },
});

// 인증번호 생성 함수
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6자리 인증번호 생성
};

verifier.post('/', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 이메일 확인
        const userCheck = await pool.query('SELECT email, password FROM users WHERE email = $1', [email]);

        if (userCheck.rows.length === 0) {
          return res.status(400).json({ message: 'Email is not Exist.' });
        }
        else if (userCheck.rows[0].password !== password){
            return res.status(400).json({ message: 'Password is Wrong.' });
        }
        else {
            const token = jwt.sign(
                { email: email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRED_TIME }
              );
          
            res.set('authorization', `Bearer ${token}`);
            res.json({ message: 'Email verified and user registered successfully!' });
            // res.redirect(`myapp://Main?jwt_token=${token}`);
        }
} catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Failed to check email.' });
  }});

verifier.post('/signup', async (req, res) => {
    const { email, password } = req.body;

  try {
    // 이메일 중복 체크
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // 인증번호 생성
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료

    // 인증번호 저장
    await pool.query('INSERT INTO email_verification (email, verification_code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET verification_code = $2, expires_at = $3', 
    [email, verificationCode, expiresAt]);

    // 이메일 전송
    const mailOptions = {
      from: 'dogun929@gmail.com',
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${verificationCode}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Verification email sent!' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to send verification email.' });
  }
});

// 인증번호 검증
verifier.post('/verify', async (req, res) => {
  const { email, verificationCode, password } = req.body;

  try {
    const verificationResult = await pool.query('SELECT * FROM email_verification WHERE email = $1 AND verification_code = $2', [email, verificationCode]);

    if (verificationResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    const { expires_at } = verificationResult.rows[0];
    if (new Date() > expires_at) {
      return res.status(400).json({ message: 'Verification code expired.' });
    }

    // 인증된 사용자 정보 저장
    await pool.query('INSERT INTO users (email, password, is_verified) VALUES ($1, $2, $3)', [email, password, true]);

    // 인증 정보 삭제
    await pool.query('DELETE FROM email_verification WHERE email = $1', [email]);
 
    const token = jwt.sign(
        { email: email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRED_TIME }
      );
  
    res.set('authorization', `Bearer ${token}`);
    res.json({ message: 'Email verified and user registered successfully!' });
    // res.redirect(`myapp://Main?jwt_token=${token}`);

  } catch (error) {
    console.error('Error during verification:', error);
    res.status(500).json({ error: 'Failed to verify email.' });
  }
});

module.exports = verifier;