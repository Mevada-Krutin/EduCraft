const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();

// Define storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // We will store everything in server/uploads/
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        // Format: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Define file filter
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpg|jpeg|png|webp|mp4|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPG, PNG, WEBP) and videos (MP4, MKV) are allowed!'));
    }
}

// Init upload
const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
    // Prevent ultra massive files overloading the standard server route
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for local dev
});

// @route   POST /api/upload
// @desc    Upload a single file (image or video)
// @access  Public (Optional: Protect via authMiddleware)
router.post('/', upload.single('media'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: 'No file uploaded' });
    }
    // Return relative URL pointing to our static server
    res.send({
        message: 'File Uploaded',
        url: `/${req.file.path.replace(/\\/g, '/')}`
    });
});

module.exports = router;
