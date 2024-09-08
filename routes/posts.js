const express = require('express');
const authenticateToken = require('../routes/auth').authenticateToken;
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const router = express.Router();

// 게시판 페이지 - 기존 게시글 목록 표시
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY upload_time DESC');

    res.json('posts', { posts: result.rows, user: req.user });
  } catch (err) {
    console.error('Error loading posts:', err);
    res.status(500).send('Error loading posts');
  }
});

router.get('/:postId', authenticateToken, async (req, res) => {
  const postId = req.params.postId;
  try {
    const result = await pool.query('SELECT * FROM posts WHERE id = $1', [postId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error loading posts:', err);
    res.status(500).send('Error loading posts');
  }
});

// 게시물 작성 처리
router.post('/create', authenticateToken, async (req, res) => {
  const { email, title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO posts (user_email, title, content) VALUES ($1, $2, $3) RETURNING id',
      [email, title, content]
    );

    const postId = result.rows[0].id;
    res.json({message: postId});
    // 올바른 리다이렉트 경로로 이동
    // res.redirect(`/comments/${postId}`);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).send('Error creating post');
  }
});

module.exports = router;