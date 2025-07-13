# Auto Blog

A full-stack Next.js application with TypeScript for automated blog management and content creation.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting**: ESLint
- **Package Manager**: npm

## Getting Started

## Getting Started

### 1. Environment Setup

Copy the environment template and configure your variables:

```bash
cp env.local .env.local
```

Edit `.env.local` with your configuration:
- **DATABASE_URL**: Your MongoDB connection string
- **JWT_SECRET**: A secure random string for JWT tokens
- **NEXTAUTH_SECRET**: A secure random string for NextAuth
- Add other API keys as needed

### 2. Database Setup

Set up your MongoDB database:

```bash
# Create .env file with your MongoDB connection string
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/auto_blog?retryWrites=true&w=majority"

# Seed the database with sample data
npx tsx src/lib/seed.ts
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Blogs
- `GET /api/blogs` - Get all published blogs (with pagination, search)
- `POST /api/blogs` - Create new blog (requires authentication)
- `GET /api/blogs/[id]` - Get single blog
- `PUT /api/blogs/[id]` - Update blog (requires authentication)
- `DELETE /api/blogs/[id]` - Delete blog (requires authentication)

## Database Schema

The application uses MongoDB with the following main entities:
- **Users**: Authentication and user management
- **Blogs**: Blog posts with authors

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) - database ORM documentation.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
