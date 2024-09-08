const express = require('express');
const pool = require('../config/database');
const router = express.Router();
const authenticateToken = require('./auth').authenticateToken;

// 특정 게시글의 댓글 페이지 표시
router.get('/:postId', authenticateToken, async (req, res) => {
const postId = req.params.postId;
try {
    const postResult = 
    await pool.query('SELECT * FROM posts LEFT JOIN comments ON posts.id = comments.post_id WHERE posts.id = $1 ', [postId]);
    // const commentsResult = await pool.query('SELECT * FROM comments WHERE post_id = $1', [postId]);

    if (postResult.rows.length === 0) {
    return res.status(404).send('Post not found');
    }

    // res.render('comments', {
    // post: postResult.rows[0],
    // comments: commentsResult.rows,
    // user: req.user
    // });
    res.json(postResult.rows).send();

} catch (err) {
    console.error('Error loading comments:', err);
    res.status(500).send('Error loading comments');
}
});

// 댓글 저장 처리
router.post('/create', authenticateToken, async (req, res) => {
const { post_id, content } = req.body;
try {
    await pool.query(
    'INSERT INTO comments (user_id, post_id, content) VALUES ($1, $2, $3)',
    [req.user.id, post_id, content]
    );
    res.redirect(`/comments/${post_id}`);
} catch (err) {
    console.error('Error saving comment:', err);
    res.status(500).send('Error saving comment');
}
});

// 댓글 좋아요 증가 처리
router.post('/like/:commentId', authenticateToken, async (req, res) => {
const commentId = req.params.commentId;
try {
    await pool.query(
    'UPDATE comments SET likes = likes + 1 WHERE comment_id = $1',
    [commentId]
    );
    res.redirect('back');  // 이전 페이지로 리다이렉트
} catch (err) {
    console.error('Error liking comment:', err);
    res.status(500).send('Error liking comment');
}
});

module.exports = router;
