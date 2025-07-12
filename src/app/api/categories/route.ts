import { NextRequest } from 'next/server'
import { successResponse, errorResponse, sanitizeInput, generateSlug } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return successResponse(categories)

  } catch (error) {
    console.error('Get categories error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    // Get user from headers (set by middleware)
    const userRole = request.headers.get('x-user-role')
    if (userRole !== 'ADMIN') {
      return errorResponse('Admin access required', 403)
    }

    if (!name) {
      return errorResponse('Category name is required')
    }

    const sanitizedName = sanitizeInput(name)
    const slug = generateSlug(sanitizedName)

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    })

    if (existingCategory) {
      return errorResponse('Category with this name already exists')
    }

    const category = await prisma.category.create({
      data: {
        name: sanitizedName,
        description: description ? sanitizeInput(description) : null,
        slug
      }
    })

    return successResponse(category, 'Category created successfully')

  } catch (error) {
    console.error('Create category error:', error)
    return errorResponse('Internal server error', 500)
  }
} 