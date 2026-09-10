module.exports = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Web Sion API is running on Vercel',
    endpoints: [
      '/api/soundcloud-profile'
    ]
  });
};
