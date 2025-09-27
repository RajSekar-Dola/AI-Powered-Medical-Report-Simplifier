function errorHandler(err, req, res, next) {
  console.error('Error occurred:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: 'error',
      message: 'File size too large. Maximum size is 5MB.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: 'error',
      message: 'Unexpected file field.'
    });
  }
  
  if (err.message && err.message.includes('Only image files are allowed')) {
    return res.status(400).json({
      status: 'error',
      message: 'Only image files are allowed.'
    });
  }
  
  if (err.message && err.message.includes('OCR')) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process image. Please ensure the image is clear and contains readable text.'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred while processing your request.'
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export {
  errorHandler,
  asyncHandler
};
