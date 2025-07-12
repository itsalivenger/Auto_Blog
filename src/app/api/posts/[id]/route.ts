import { NextRequest } from 'next/server'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/posts/[id] - Get single post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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

    if (!post) {
      return errorResponse('Post not found', 404)
    }

    return successResponse(post)

  } catch (error) {
    console.error('Get post error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// PUT /api/posts/[id] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, categoryId, published } = body

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse('Authentication required', 401)
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return errorResponse('Post not found', 404)
    }

    if (existingPost.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    const updateData: any = {}
    
    if (title !== undefined) {
      updateData.title = sanitizeInput(title)
    }
    
    if (content !== undefined) {
      updateData.content = sanitizeInput(content)
    }
    
    if (categoryId !== undefined) {
      updateData.categoryId = categoryId
    }
    
    if (published !== undefined) {
      updateData.published = published
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: updateData,
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

    return successResponse(post, 'Post updated successfully')

  } catch (error) {
    console.error('Update post error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE /api/posts/[id] - Delete post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse('Authentication required', 401)
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: params.id }
    })

    if (!existingPost) {
      return errorResponse('Post not found', 404)
    }

    if (existingPost.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    await prisma.post.delete({
      where: { id: params.id }
    })

    return successResponse(null, 'Post deleted successfully')

  } catch (error) {
    console.error('Delete post error:', error)
    return errorResponse('Internal server error', 500)
  }
} 