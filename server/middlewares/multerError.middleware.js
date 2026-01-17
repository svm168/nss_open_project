// Wrapper to catch multer errors
export const handleMulterError = (middleware) => {
	return (req, res, next) => {
		middleware(req, res, (err) => {
			if (err) {
				// Multer errors
				if (err.code === 'LIMIT_FILE_SIZE') {
					return res.status(400).json({
						success: false,
						message: 'File size exceeds the limit of 5MB',
					})
				}
				if (err.code === 'LIMIT_FILE_COUNT') {
					return res.status(400).json({
						success: false,
						message: 'Too many files uploaded',
					})
				}
				if (err.message === 'Only image files are allowed') {
					return res.status(400).json({
						success: false,
						message: 'Only image files are allowed',
					})
				}
				// Generic multer error
				console.error('Multer Error:', err)
				return res.status(400).json({
					success: false,
					message: err.message || 'File upload error',
				})
			}
			next()
		})
	}
}
