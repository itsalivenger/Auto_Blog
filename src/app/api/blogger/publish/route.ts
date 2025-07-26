import { NextRequest, NextResponse } from 'next/server'
import { scheduleBloggerPost } from '@/lib/blogger-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { blog, publishDate, publishTime, publishNow } = body

    console.log('Blogger publish request:', { blogId: blog._id, publishDate, publishTime, publishNow })

    if (!blog || !blog._id) {
      return NextResponse.json(
        { error: 'Blog data is required' },
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

    

    console.log('Blog data received:', {
      title: blog.title,
      contentLength: blog.content?.length || 0,
      hasImages: blog.images && blog.images.length > 0,
      imageCount: blog.images?.length || 0
    })

    // Prepare the post for Blogger
    const imagesToSend = blog.images ? [...blog.images] : []
    if (imagesToSend.length > 1) {
      // Swap the first and second images to make the second image the primary one
      [imagesToSend[0], imagesToSend[1]] = [imagesToSend[1], imagesToSend[0]]
    }

    const post = {
      title: blog.title,
      content: blog.content,
      images: imagesToSend
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