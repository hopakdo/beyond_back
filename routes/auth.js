const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const authenticateToken = (req, res, next) => {

  let authHeader = req.headers['authorization'];
  let token = authHeader.split(' ')[1]; 

  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next()
  })
};

// Google OAuth 로그인 라우트
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// Google OAuth 콜백 라우트
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' , session: false }),
  (req, res) => {
    console.log('id :', req.user.id)
    // JWT 생성
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRED_TIME }
    );

    res.set('authorization', `Bearer ${token}`);
    res.set('accessToken', `${req.user.accessToken}`);

    //browser cookies
    // res.cookie('Authorization', `${token}`, { httpOnly:true});
    // res.cookie('accessToken', `${req.user.accessToken}`, { maxAge: process.env.JWT_EXPIRED_TIME, httpOnly:true});
    
    //browser_end_point
    // res.redirect(`/posts?authorization=Bearer ${token}&accessToken=${req.user.accessToken}`);

    //mobile_end_point
    res.redirect(`myapp://auth?access_token=${req.user.accessToken}&jwt_token=${token}&refresh_token=${req.user.refreshToken}`);
    // res.status(200).send()
  }
);

exports.router = router;
exports.authenticateToken = authenticateToken;