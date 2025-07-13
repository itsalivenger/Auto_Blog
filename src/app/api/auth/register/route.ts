import { NextRequest } from 'next/server'
import { successResponse, errorResponse, validateEmail, validatePassword } from '@/lib/utils'
import { hashPassword, generateToken } from '@/lib/auth'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validation
    if (!email || !password || !name) {
      return errorResponse('Email, password, and name are required')
    }

    if (!validateEmail(email)) {
      return errorResponse('Invalid email format')
    }

    if (!validatePassword(password)) {
      return errorResponse('Password must be at least 8 characters long')
    }

    const db = await getDb()

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })

    if (existingUser) {
      return errorResponse('User with this email already exists')
    }

    // Hash password and create user
    const hashedPassword = hashPassword(password)
    
    const user = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      name,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const createdUser = await db.collection('users').findOne({ _id: user.insertedId })

    // Generate token
    const token = generateToken({
      userId: createdUser!._id.toString(),
      email: createdUser!.email,
      role: createdUser!.role
    })

    return successResponse({
      user: {
        id: createdUser!._id.toString(),
        email: createdUser!.email,
        name: createdUser!.name,
        role: createdUser!.role
      },
      token
    }, 'User registered successfully')

  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Internal server error', 500)
  }
} 