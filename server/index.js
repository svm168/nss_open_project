import express from 'express'
import connectDB from './db/mongodb.js'
import 'dotenv/config' //This is also a good syntax without any useless configurations.
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'

const app = express()
const port = process.env.PORT || 3000
connectDB()

const allowedOrigins = process.env.ALLOWED_ORIGINS

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: allowedOrigins, credentials: true }))

// API End points:
app.get('/', (req, res) => res.send('Backend Working fine.'))
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)

app.listen(port, () => console.log(`Server listening on port: ${port}`))