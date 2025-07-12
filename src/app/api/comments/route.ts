import { NextRequest } from 'next/server'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const approved = searchParams.get('approved')

    if (!postId) {
      return errorResponse('Post ID is required')
    }

    const where: any = { postId }
    
    if (approved !== null) {
      where.approved = approved === 'true'
    }

    const comments = await prisma.comment.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(comments)

  } catch (error) {
    console.error('Get comments error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// POST /api/comments - Create new comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, postId } = body

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse('Authentication required', 401)
    }

    if (!content || !postId) {
      return errorResponse('Content and post ID are required')
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    const sanitizedContent = sanitizeInput(content)

    const comment = await prisma.comment.create({
      data: {
        content: sanitizedContent,
        authorId: userId,
        postId,
        approved: false // Comments need approval by default
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

    return successResponse(comment, 'Comment created successfully')

  } catch (error) {
    console.error('Create comment error:', error)
    return errorResponse('Internal server error', 500)
  }
} 