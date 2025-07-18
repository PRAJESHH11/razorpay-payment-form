import mongoose from "mongoose"

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(
            process.env.MONGODB_URI || 'mongodb://localhost:2701/payment_app',
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        )
        console.log(`MongoDB Connected: ${conn.connection.host}`)
    }
    catch(error){
        console.error('MongoDB connection error:', error)
        process.exit(1)
    }
}