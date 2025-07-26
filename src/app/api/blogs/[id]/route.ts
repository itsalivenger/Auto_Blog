import { NextRequest } from 'next/server'
import { successResponse, errorResponse, sanitizeInput } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

// GET /api/blogs/[id] - Get single blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDb()

    const blog = await db.collection('blogs').findOne({ _id: new ObjectId(params.id) })

    if (!blog) {
      return errorResponse('Blog not found', 404)
    }

    const author = await db.collection('users').findOne(
      { _id: new ObjectId(blog.authorId) },
      { projection: { password: 0 } }
    )

    return successResponse({
      ...blog,
      id: blog._id.toString(),
      author: author ? {
        id: author._id.toString(),
        name: author.name,
        email: author.email
      } : null
    })

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

    const db = await getDb()

    // Check if blog exists and user owns it
    const existingBlog = await db.collection('blogs').findOne({ _id: new ObjectId(params.id) })

    if (!existingBlog) {
      return errorResponse('Blog not found', 404)
    }

    if (existingBlog.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    const updateData: any = { updatedAt: new Date() }
    
    if (title !== undefined) {
      updateData.title = sanitizeInput(title)
    }
    
    if (content !== undefined) {
      updateData.content = sanitizeInput(content)
    }
    
    if (published !== undefined) {
      updateData.published = published
    }

    await db.collection('blogs').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    )

    const updatedBlog = await db.collection('blogs').findOne({ _id: new ObjectId(params.id) })
    const author = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    return successResponse({
      ...updatedBlog,
      id: updatedBlog!._id.toString(),
      author: author ? {
        id: author._id.toString(),
        name: author.name,
        email: author.email
      } : null
    }, 'Blog updated successfully')

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

    const db = await getDb()

    // Check if blog exists and user owns it
    const existingBlog = await db.collection('blogs').findOne({ _id: new ObjectId(params.id) })

    if (!existingBlog) {
      return errorResponse('Blog not found', 404)
    }

    if (existingBlog.authorId !== userId) {
      return errorResponse('Unauthorized', 403)
    }

    await db.collection('blogs').deleteOne({ _id: new ObjectId(params.id) })

    return successResponse(null, 'Blog deleted successfully')

  } catch (error) {
    console.error('Delete blog error:', error)
    return errorResponse('Internal server error', 500)
  }
} 