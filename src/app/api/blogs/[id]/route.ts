import { NextRequest } from 'next/server'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/utils'
import prisma from '@/lib/db'

// GET /api/blogs/[id] - Get single blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
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

    if (!blog) {
      return errorResponse('Blog not found', 404)
    }

    return successResponse(blog)

  } catch (error) {
    console.error('Get blog error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, published } = body

    // Get user from headers (set by middleware)
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return errorResponse('Authentication required', 401)
    }

    // Check if blog exists and user owns it
    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id }
    })

    if (!existingBlog) {
      return errorResponse('Blog not found', 404)
    }

    if (existingBlog.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    const updateData: any = {}
    
    if (title !== undefined) {
      updateData.title = sanitizeInput(title)
    }
    
    if (content !== undefined) {
      updateData.content = sanitizeInput(content)
    }
    
    if (published !== undefined) {
      updateData.published = published
    }

    const blog = await prisma.blog.update({
      where: { id: params.id },
      data: updateData,
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

    return successResponse(blog, 'Blog updated successfully')

  } catch (error) {
    console.error('Update blog error:', error)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE /api/blogs/[id] - Delete blog
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

    // Check if blog exists and user owns it
    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id }
    })

    if (!existingBlog) {
      return errorResponse('Blog not found', 404)
    }

    if (existingBlog.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    await prisma.blog.delete({
      where: { id: params.id }
    })

    return successResponse(null, 'Blog deleted successfully')

  } catch (error) {
    console.error('Delete blog error:', error)
    return errorResponse('Internal server error', 500)
  }
} 