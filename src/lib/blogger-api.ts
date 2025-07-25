const OAUTH_CLIENT_ID = process.env.OAUTH_CLIENT_ID
const BLOGGER_CLIENT_SECRET = process.env.BLOGGER_CLIENT_SECRET
const BLOGGER_REFRESH_TOKEN = process.env.BLOGGER_REFRESH_TOKEN
const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID

interface BloggerPost {
  title: string
  content: string
  published?: string
  images?: string[]
}

export async function getAccessToken(): Promise<string> {
  try {
    if (!BLOGGER_CLIENT_SECRET || !BLOGGER_REFRESH_TOKEN) {
      throw new Error('Blogger client secret and refresh token are required')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CLIENT_ID!,
        client_secret: BLOGGER_CLIENT_SECRET,
        refresh_token: BLOGGER_REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OAuth refresh error:', errorText)
      throw new Error(`Failed to refresh access token: ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting access token:', error)
    throw new Error('Failed to authenticate with Blogger API')
  }
}

export async function publishToBlogger(post: BloggerPost): Promise<any> {
  try {
    if (!OAUTH_CLIENT_ID || !BLOGGER_REFRESH_TOKEN || !BLOGGER_BLOG_ID) {
      throw new Error('Blogger API credentials not configured')
    }

    const accessToken = await getAccessToken()
    
    // Create structured content with images distributed throughout
    let content = post.content
    
    // Add images to the content in a structured manner
    if (post.images && post.images.length > 0) {
      // Split content into paragraphs
      const paragraphs = content.split('\n\n')
      
      // Calculate how many images to distribute
      const imageCount = post.images.length
      const paragraphCount = paragraphs.length
      
      // Create structured content with images
      let structuredContent = ''
      let imageIndex = 0
      
      for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i].trim()
        
        // Add the paragraph
        if (paragraph) {
          structuredContent += paragraph + '\n\n'
        }
        
        // Add an image after every few paragraphs (distribute evenly)
        if (imageIndex < imageCount) {
          const shouldAddImage = (i + 1) % Math.max(1, Math.floor(paragraphCount / imageCount)) === 0 || i === paragraphs.length - 1
          
          if (shouldAddImage) {
            const imageUrl = post.images[imageIndex]
            structuredContent += `<div style="text-align: center; margin: 20px 0;">
  <img src="${imageUrl}" alt="Blog image ${imageIndex + 1}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
  <p style="font-size: 12px; color: #666; margin-top: 8px; font-style: italic;">Image ${imageIndex + 1}</p>
</div>\n\n`
            imageIndex++
          }
        }
      }
      
      // If we have more images than paragraphs, add remaining images at the end
      while (imageIndex < imageCount) {
        const imageUrl = post.images[imageIndex]
        structuredContent += `<div style="text-align: center; margin: 20px 0;">
  <img src="${imageUrl}" alt="Blog image ${imageIndex + 1}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
  <p style="font-size: 12px; color: #666; margin-top: 8px; font-style: italic;">Image ${imageIndex + 1}</p>
</div>\n\n`
        imageIndex++
      }
      
      content = structuredContent.trim()
    }

    const postData = {
      kind: 'blogger#post',
      blog: {
        id: BLOGGER_BLOG_ID
      },
      title: post.title,
      content: content,
      published: post.published || new Date().toISOString(),
    }

    console.log('Publishing to Blogger with data:', {
      blogId: BLOGGER_BLOG_ID,
      title: post.title,
      hasImages: post.images && post.images.length > 0,
      imageCount: post.images?.length || 0,
      published: post.published
    })

    const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOGGER_BLOG_ID}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Blogger API error:', errorData)
      throw new Error(`Failed to publish to Blogger: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    console.log('Successfully published to Blogger:', result)
    return result
  } catch (error) {
    console.error('Error publishing to Blogger:', error)
    throw error
  }
}

export async function scheduleBloggerPost(post: BloggerPost, publishDate: string, publishTime: string): Promise<any> {
  try {
    // Combine date and time into ISO string
    const publishDateTime = new Date(`${publishDate}T${publishTime}`).toISOString()
    
    console.log('Scheduling post for:', publishDateTime)
    
    // Update the post with the scheduled publish date
    const scheduledPost = {
      ...post,
      published: publishDateTime
    }
    
    return await publishToBlogger(scheduledPost)
  } catch (error) {
    console.error('Error scheduling Blogger post:', error)
    throw error
  }
} 