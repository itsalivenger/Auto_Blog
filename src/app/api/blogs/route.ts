import { NextRequest } from 'next/server'
import { successResponse, errorResponse, generateSlug, sanitizeInput } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { ObjectId } from 'mongodb'

// GET /api/blogs - Get all blogs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const db = await getDb()

    let query: any = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    const [blogs, total] = await Promise.all([
      db.collection('blogs').find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('blogs').countDocuments(query)
    ])

    // Get author information for each blog
    const blogsWithAuthors = await Promise.all(
      blogs.map(async (blog) => {
        const author = await db.collection('users').findOne(
          { _id: new ObjectId(blog.authorId) },
          { projection: { password: 0 } }
        )
        return {
          ...blog,
          id: blog._id.toString(),
          author: author ? {
            id: author._id.toString(),
            name: author.name,
            email: author.email
          } : null
        }
      })
    )

    return successResponse({
      blogs: blogsWithAuthors,
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

    const db = await getDb()

    const blog = await db.collection('blogs').insertOne({
      title: sanitizedTitle,
      content: sanitizedContent,
      slug,
      published,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const createdBlog = await db.collection('blogs').findOne({ _id: blog.insertedId })
    const author = await db.collection('users').findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    )

    return successResponse({
      ...createdBlog,
      id: createdBlog!._id.toString(),
      author: author ? {
        id: author._id.toString(),
        name: author.name,
        email: author.email
      } : null
    }, 'Blog created successfully')

  } catch (error) {
    console.error('Create blog error:', error)
    return errorResponse('Internal server error', 500)
  }
} 