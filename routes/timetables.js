const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path'); // 추가: HTML 파일 경로를 설정하기 위해 필요
const pool = require('../config/database');
const router = express.Router();
const authenticateToken = require('./auth').authenticateToken;

// // '/timetables' 경로 정의 (HTML 파일 반환)
// router.get('/timetables', authenticateToken, (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'views', 'timetable.html'));
// });

// // 타임테이블 유지 (이 부분은 원래대로 유지)
// router.get('/', authenticateToken, (req, res) => {
//     res.render('timetables', { user: req.user });
// });

router.get('/:email', authenticateToken, async (req, res) => {
    const email = req.params.email;
    try {
    const postResult = await pool.query('SELECT * FROM events WHERE user_email = $1', [email]);
    // res.render('timetables', { user: req.user });
    res.json(postResult.rows);
    } catch (err) {
        console.error('Error loading comments:', err);
        res.status(500).send('Error loading comments');}});

// 타임테이블 작성 처리
router.post('/create', authenticateToken, async (req, res) => {
    const { email, title, day, startTime, endTime, location, init_date } = req.body;
    
    try {
        await pool.query(
            'INSERT INTO events (user_email, title, day, startTime, endTime, location, init_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [email, title, day, startTime, endTime, location, init_date]
        );
        // 데이터를 삽입한 후, 필요한 페이지로 리다이렉트 또는 응답을 전송합니다.
        // res.redirect('/timetables'); // 또는 원하는 다른 페이지로 리다이렉트
        //또는 
        res.status(201).send('Schedule created successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating schedule');
    }
});

module.exports = router;