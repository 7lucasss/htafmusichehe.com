const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const jobPermission = require('../middleware/jobPermission');
const jobUpload = require('../middleware/jobUpload');
const Job = require('../models/Job');
const User = require('../models/User');

// @route   GET api/jobs
// @desc    Get all active job listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const jobs = await Job.find({ 
      isActive: true,
      expiresAt: { $gt: now }
    })
    .populate('postedBy', 'name')
    .sort('-createdAt');
    
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   POST api/jobs
// @desc    Create a new job listing
// @access  Private
router.post('/', auth, jobPermission, async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      requirements,
      jobType,
      salary,
      applicationEmailAddress,
      applicationUrl,
      logo,
      coverImage,
      duration
    } = req.body;
    
    // Set expiration date (default 30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (duration || 30));
    
    const newJob = new Job({
      title,
      company,
      location,
      description,
      requirements: requirements || [],
      jobType,
      salary,
      applicationEmailAddress,
      applicationUrl,
      logo,
      coverImage,
      postedBy: req.user.id,
      expiresAt
    });
    
    const job = await newJob.save();
    res.status(201).json(job);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name avatar userType')
      .populate({
        path: 'comments.user',
        select: 'name avatar userType'
      });
    
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    
    res.json(job);
  } catch (err) {
    console.error('Error fetching job:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Thêm route để admin quản lý tin tuyển dụng
router.get('/admin', auth, require('../middleware/admin'), async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort('-createdAt');
    
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs for admin:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Route để admin có thể cập nhật hoặc xóa bất kỳ tin tuyển dụng nào
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    // Kiểm tra xem tin tồn tại không
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    
    // Kiểm tra quyền: chỉ admin hoặc người đăng tin mới có quyền cập nhật
    const user = await User.findById(req.user.id);
    if (job.postedBy.toString() !== req.user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền sửa tin này' });
    }
    
    // Cập nhật tin
    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    
    res.json(updatedJob);
  } catch (err) {
    console.error('Error updating job:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Route đăng tin nhanh với upload ảnh
router.post('/quick', auth, jobPermission, jobUpload.array('images', 4), async (req, res) => {
  try {
    const { title, description, company, location } = req.body;
    
    // Lấy URLs của các ảnh đã upload
    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const newJob = new Job({
      title,
      description,
      company,
      location,
      postedBy: req.user.id,
      images: imageUrls
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      data: newJob,
      message: 'Job posted successfully'
    });

  } catch (error) {
    console.error('Error creating quick job:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating job',
      error: error.message
    });
  }
});

// @route   POST api/jobs/:id/like
// @desc    Like or unlike a job
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    
    // Check if job is already liked by this user
    const likeIndex = job.likes.indexOf(req.user.id);
    
    if (likeIndex === -1) {
      // Not liked yet, like the job
      job.likes.push(req.user.id);
    } else {
      // Already liked, unlike it
      job.likes.splice(likeIndex, 1);
    }
    
    await job.save();
    
    res.json({
      success: true,
      isLiked: likeIndex === -1, // Returns true if job was liked, false if unliked
      likeCount: job.likes.length
    });
  } catch (err) {
    console.error('Error toggling job like:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   POST api/jobs/:id/comments
// @desc    Add comment to job
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Nội dung bình luận không được để trống' });
    }
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    
    const comment = {
      user: req.user.id,
      text
    };
    
    job.comments.unshift(comment);
    await job.save();
    
    // Truy vấn lại để lấy comment mới với dữ liệu user đầy đủ
    const updatedJob = await Job.findById(req.params.id)
      .populate({
        path: 'comments.user',
        select: 'name avatar userType'
      });
    
    res.json(updatedJob.comments[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// @route   DELETE api/jobs/:id/comment/:comment_id
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comment/:comment_id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Không tìm thấy tin tuyển dụng' });
    }
    
    // Find the comment
    const comment = job.comments.find(comment => comment._id.toString() === req.params.comment_id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận' });
    }
    
    // Check if user is authorized (comment owner or admin)
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xóa bình luận này' });
    }
    
    // Remove comment
    const commentIndex = job.comments.findIndex(comment => comment._id.toString() === req.params.comment_id);
    job.comments.splice(commentIndex, 1);
    
    await job.save();
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 