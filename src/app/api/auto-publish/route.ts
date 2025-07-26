import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { improveForSEO } from '@/lib/ai-utils'
import { scheduleBloggerPost } from '@/lib/blogger-api'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  let blogToPublish = null;
  let bloggerResult = null;

  try {
    const db = await getDb()

    // 1. Fetch an unpublished blog
    blogToPublish = await db.collection('blogs').findOne({
      published: false
    }, {
      sort: { createdAt: 1 } // Get the oldest unpublished blog
    })

    if (!blogToPublish) {
      await sendEmail({
        to: process.env.ADMIN_EMAIL || '',
        subject: 'Auto-Publish: No Unpublished Blogs Found',
        html: '<p>Dear Admin,</p><p>The auto-publish cron job ran, but no unpublished blogs were found in the database.</p><p>Best regards,</p><p>Your Auto-Blogger</p>',
      });
      return NextResponse.json({ message: 'No unpublished blogs found.' }, { status: 200 })
    }

    // 2. Improve content for SEO
    const improvedContent = await improveForSEO(blogToPublish.content)

    // 3. Determine publish date/time
    let publishDate: string
    let publishTime: string
    let publishNow: boolean

    const body = await request.json().catch(() => ({})) // Handle empty body

    if (Object.keys(body).length === 0) {
      publishNow = true
      const now = new Date()
      publishDate = now.toISOString().split('T')[0]
      publishTime = now.toISOString().split('T')[1].split('.')[0]
    } else {
      publishNow = false
      publishDate = body.publishDate
      publishTime = body.publishTime

      if (!publishDate || !publishTime) {
        return NextResponse.json({ error: 'Publish date and time are required in the body if not publishing instantly.' }, { status: 400 })
      }
    }

    // 4. Publish to Blogger
    const post = {
      title: blogToPublish.title,
      content: improvedContent,
      images: blogToPublish.images || []
    }

    const bloggerResult = await scheduleBloggerPost(post, publishDate, publishTime)

    // 5. Update blog status in DB
    await db.collection('blogs').updateOne(
      { _id: new ObjectId(blogToPublish._id) },
      { $set: {
          published: true,
          published_at: new Date(), // Set published_at to now
          bloggerPostId: bloggerResult.id,
          bloggerPostUrl: bloggerResult.url
        }
      }
    )

    return NextResponse.json({
      message: 'Blog improved and published successfully',
      blogId: blogToPublish._id,
      bloggerPostId: bloggerResult.id,
      bloggerPostUrl: bloggerResult.url,
      scheduledFor: publishNow ? 'Now' : `${publishDate} ${publishTime}`
    }, { status: 200 })

  } catch (error) {
    console.error('Error in auto-publish route:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to auto-publish blog' },
      { status: 500 }
    )
  } finally {
    // Send email notification
    if (blogToPublish && bloggerResult) {
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL || '', // Replace with your admin email
          subject: `Blog Published: ${blogToPublish.title}`,
          html: `
            <p>Dear Ali,</p>
            <p>A new blog post has been successfully published to Blogger:</p>
            <p><strong>Title:</strong> ${blogToPublish.title}</p>
            <p><strong>Blogger Post ID:</strong> ${bloggerResult.id}</p>
            <p><strong>Blogger Post URL:</strong> <a href="${bloggerResult.url}">${bloggerResult.url}</a></p>
            <p><strong>Scheduled For:</strong> ${publishNow ? 'Now' : `${publishDate} ${publishTime}`}</p>
            <p>Best regards,</p>
            <p>Your Auto-Blogger</p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }
  }
}

