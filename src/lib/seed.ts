import { getDb } from './db'
import { hashPassword } from './auth'

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    const db = await getDb()

    // Create admin user
    const adminUser = await db.collection('users').findOne({ email: 'admin@autoblog.com' })
    
    if (!adminUser) {
      const result = await db.collection('users').insertOne({
        email: 'admin@autoblog.com',
        password: hashPassword('admin123'),
        name: 'Admin User',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log('✅ Admin user created:', 'admin@autoblog.com')
    } else {
      console.log('✅ Admin user already exists:', adminUser.email)
    }

    // Create sample blogs
    const sampleBlogs = [
      {
        title: 'Welcome to Auto Blog',
        content: 'This is your first blog post. Start writing amazing content!',
        slug: 'welcome-to-auto-blog',
        excerpt: 'Welcome to your new blog platform',
        published: true,
        featured: true,
        authorId: adminUser?._id.toString() || 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Getting Started with Blogging',
        content: 'Learn how to create engaging content and grow your audience.',
        slug: 'getting-started-with-blogging',
        excerpt: 'Essential tips for new bloggers',
        published: true,
        featured: false,
        authorId: adminUser?._id.toString() || 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    for (const blog of sampleBlogs) {
      const existingBlog = await db.collection('blogs').findOne({ slug: blog.slug })
      if (!existingBlog) {
        await db.collection('blogs').insertOne(blog)
        console.log('✅ Sample blog created:', blog.title)
      } else {
        console.log('✅ Sample blog already exists:', blog.title)
      }
    }

    console.log('🎉 Database seeding completed!')
  } catch (error) {
    console.error('❌ Seeding error:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  }) 