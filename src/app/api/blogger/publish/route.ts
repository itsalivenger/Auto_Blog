import { NextRequest, NextResponse } from 'next/server'
import { scheduleBloggerPost } from '@/lib/blogger-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blogId, publishDate, publishTime, publishNow } = body

    console.log('Blogger publish request:', { blogId, publishDate, publishTime, publishNow })

    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      )
    }

    if (!publishNow && (!publishDate || !publishTime)) {
      return NextResponse.json(
        { error: 'Publish date and time are required, or set publishNow to true' },
        { status: 400 }
      )
    }

    // Get the token from the request headers
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch the blog data
    const blogResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/blogs/${blogId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!blogResponse.ok) {
      const errorData = await blogResponse.text()
      console.error('Failed to fetch blog data:', errorData)
      throw new Error('Failed to fetch blog data')
    }

    const blogData = await blogResponse.json()
    const blog = blogData.blog

    console.log('Blog data fetched:', {
      title: blog.title,
      hasImages: blog.images && blog.images.length > 0,
      imageCount: blog.images?.length || 0
    })

    // Prepare the post for Blogger
    const post = {
      title: blog.title,
      content: blog.content,
      images: blog.images || []
    }

    // Schedule the post on Blogger
    const result = await scheduleBloggerPost(post, publishDate, publishTime)

    const message = publishNow 
      ? 'Blog published to Blogger'
      : 'Blog scheduled for publication on Blogger'

    console.log('Blogger publish successful:', {
      bloggerPostId: result.id,
      bloggerPostUrl: result.url,
      publishNow,
      scheduledFor: publishNow ? 'Now' : `${publishDate} ${publishTime}`
    })

    return NextResponse.json({
      success: true,
      message,
      publishNow,
      scheduledFor: publishNow ? 'Now' : `${publishDate} ${publishTime}`,
      bloggerPostId: result.id,
      bloggerPostUrl: result.url
    })

  } catch (error) {
    console.error('Error publishing to Blogger:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish to Blogger' },
      { status: 500 }
    )
  }
} 