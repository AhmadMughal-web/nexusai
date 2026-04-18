export function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `This ${field} is already taken.` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: Object.values(err.errors)[0].message });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error.' });
}
