import mongoose from 'mongoose'
import { DB_NAME } from '../constants.js'

const connectDB = async () => {
	try {
		const connectionInstance = await mongoose.connect(
			`${process.env.MONGODB_URI}/${DB_NAME}`
		)
		console.log(
			`MongoDB connected. DB Host: ${connectionInstance.connection.host}`
		)			// Connection host doesn't carry any sensitive info, its just the DNS.
	} catch (error) {
		console.log(
			'MongoDB connection error. Error code: ',
			error
		)
		process.exit(1)
	}
}

export default connectDB
