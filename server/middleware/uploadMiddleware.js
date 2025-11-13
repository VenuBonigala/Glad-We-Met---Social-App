import multer from 'multer';

// We'll use memoryStorage to temporarily store the file in memory
// before it gets uploaded to Cloudinary.
const storage = multer.memoryStorage();

// Initialize multer
const upload = multer({
  storage: storage,
  // You can add file filters here (e.g., only allow .png, .jpg)
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
});

export { upload };