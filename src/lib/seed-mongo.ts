import mongoose from 'mongoose'
import User from '../models/User'
import { hashPassword } from './auth'
import dotenv from 'dotenv'
dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  )
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB for seeding')

    // Clear existing users
    await User.deleteMany({})
    console.log('Cleared existing users')

    // Create a default admin user
    const hashedPassword = hashPassword('admin123') // Replace with a strong password
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    })
    console.log('Admin user created')

    console.log('Seeding complete')
  } catch (error) {
    console.error('Seeding error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

seed()
