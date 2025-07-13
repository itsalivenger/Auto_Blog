import { NextRequest } from 'next/server'
import { successResponse, errorResponse, generateSlug, sanitizeInput } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/blogs - Get all blogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {
      published: true
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.blog.count({ where })
    ])

    return successResponse({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get blogs error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST /api/blogs - Create new blog
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, published = false } = body

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse('Authentication required', 401)
    }

    if (!title || !content) {
      return errorResponse('Title and content are required')
    }

    const slug = generateSlug(title)
    const sanitizedTitle = sanitizeInput(title)
    const sanitizedContent = sanitizeInput(content)

    const blog = await prisma.blog.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        slug,
        published,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return successResponse(blog, 'Blog created successfully')

  } catch (error) {
    console.error('Create blog error:', error)
    return errorResponse('Internal server error', 500)
  }
} 