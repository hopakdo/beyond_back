const express = require('express');
const multer = require('multer');
const path = require('path');
const uploder = express.Router();
require('dotenv').config();

// 업로드된 파일을 저장할 디렉터리 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './UploadFiles/'); // 파일을 저장할 경로 (예: 'uploads/' 폴더)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`; // 파일 이름에 고유한 식별자를 추가
    cb(null, `${uniqueSuffix}-${file.originalname}`); // 고유한 파일 이름 설정
  }
});

const upload = multer({ // Multer 설정
    storage,
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf']; // 허용된 MIME 타입 목록
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // 허용된 파일 타입인 경우 업로드 진행
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.')); // MIME 타입이 허용되지 않으면 오류 반환
      }
    },
    limits: { fileSize: 5 * 1024 * 1024 }
  });



// 파일 업로드 라우트
uploder.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  console.log('Uploaded file:', req.file); // 업로드된 파일 정보 로그 출력
  res.send('File uploaded successfully.');
});

module.exports = uploder;
