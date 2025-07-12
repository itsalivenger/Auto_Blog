import { NextRequest } from 'next/server'
import { successResponse, errorResponse, generateSlug, sanitizeInput } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {
      published: true
    }

    if (category) {
      where.category = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ])

    return successResponse({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Get posts error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST /api/posts - Create new post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, categoryId, published = false } = body

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

    const post = await prisma.post.create({
      data: {
        title: sanitizedTitle,
        content: sanitizedContent,
        slug,
        published,
        authorId: userId,
        categoryId: categoryId || null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true
      }
    })

    return successResponse(post, 'Post created successfully')

  } catch (error) {
    console.error('Create post error:', error)
    return errorResponse('Internal server error', 500)
  }
} 