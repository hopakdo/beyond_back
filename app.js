const express = require('express');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');  // Passport 설정

const verifier = require('./routes/login');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const timetablesRoutes = require('./routes/timetables');
const commentsRoutes = require('./routes/comments');

const app = express();

// 미들웨어 설정
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

// View 엔진 설정
app.set('view engine', 'ejs');

// 라우팅
app.use('/auth', authRoutes.router);
app.use('/posts', postRoutes);
app.use('/login', verifier);
app.use('/timetables', timetablesRoutes);
app.use('/comments', commentsRoutes);



// 홈 페이지 (로그인 페이지)
app.get('/', (req, res) => {
  res.render('login');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
