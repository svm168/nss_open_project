import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure storage
const storage = multer.diskStorage({
	destination: async (req, file, cb) => {
		const uploadDir = path.join(__dirname, '../public/uploads')
		try {
			// Ensure directory exists
			await fs.mkdir(uploadDir, { recursive: true })
			cb(null, uploadDir)
		} catch (err) {
			cb(err)
		}
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
		cb(null, uniqueSuffix + path.extname(file.originalname))
	},
})

const fileFilter = (req, file, cb) => {
	const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
	if (allowedMimes.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb(new Error('Only image files are allowed'), false)
	}
}

const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB limit
	},
})

export default upload