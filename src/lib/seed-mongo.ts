import prisma from './db'
import { hashPassword } from './auth'

async function main() {
  console.log('🌱 Starting database seeding...')

  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@autoblog.com' },
      update: {},
      create: {
        email: 'admin@autoblog.com',
        password: hashPassword('admin123'),
        name: 'Admin User',
        role: 'ADMIN'
      }
    })

    console.log('✅ Admin user created:', adminUser.email)

    // Create sample categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'technology' },
        update: {},
        create: {
          name: 'Technology',
          description: 'Latest tech news and updates',
          slug: 'technology'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'lifestyle' },
        update: {},
        create: {
          name: 'Lifestyle',
          description: 'Health, wellness, and lifestyle tips',
          slug: 'lifestyle'
        }
      }),
      prisma.category.upsert({
        where: { slug: 'business' },
        update: {},
        create: {
          name: 'Business',
          description: 'Business insights and strategies',
          slug: 'business'
        }
      })
    ])

    console.log('✅ Categories created:', categories.map(c => c.name))

    // Create sample posts
    const posts = await Promise.all([
      prisma.post.upsert({
        where: { slug: 'welcome-to-auto-blog' },
        update: {},
        create: {
          title: 'Welcome to Auto Blog',
          content: 'This is your first blog post. Start writing amazing content!',
          slug: 'welcome-to-auto-blog',
          excerpt: 'Welcome to your new blog platform',
          published: true,
          featured: true,
          authorId: adminUser.id,
          categoryId: categories[0].id
        }
      }),
      prisma.post.upsert({
        where: { slug: 'getting-started-with-blogging' },
        update: {},
        create: {
          title: 'Getting Started with Blogging',
          content: 'Learn how to create engaging content and grow your audience.',
          slug: 'getting-started-with-blogging',
          excerpt: 'Essential tips for new bloggers',
          published: true,
          featured: false,
          authorId: adminUser.id,
          categoryId: categories[1].id
        }
      }),
      prisma.post.upsert({
        where: { slug: 'the-future-of-content-creation' },
        update: {},
        create: {
          title: 'The Future of Content Creation',
          content: 'Explore how AI and automation are transforming the way we create and consume content.',
          slug: 'the-future-of-content-creation',
          excerpt: 'AI-powered content creation trends',
          published: true,
          featured: true,
          authorId: adminUser.id,
          categoryId: categories[0].id
        }
      })
    ])

    console.log('✅ Sample posts created:', posts.map(p => p.title))

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
  .finally(async () => {
    await prisma.$disconnect()
  }) 