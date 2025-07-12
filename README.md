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
cp env.example .env.local
```

Edit `.env.local` with your configuration:
- **DATABASE_URL**: Your PostgreSQL connection string
- **JWT_SECRET**: A secure random string for JWT tokens
- **NEXTAUTH_SECRET**: A secure random string for NextAuth
- Add other API keys as needed

### 2. Database Setup

Install and set up your database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

### 3. Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Database Management

```bash
# Open Prisma Studio (database GUI)
npm run db:studio

# Generate Prisma client after schema changes
npm run db:generate
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Posts
- `GET /api/posts` - Get all published posts (with pagination, search, filtering)
- `POST /api/posts` - Create new post (requires authentication)
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post (requires authentication)
- `DELETE /api/posts/[id]` - Delete post (requires authentication)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (requires admin)

### Comments
- `GET /api/comments?postId=[id]` - Get comments for a post
- `POST /api/comments` - Create comment (requires authentication)

## Database Schema

The application uses PostgreSQL with the following main entities:
- **Users**: Authentication and user management
- **Posts**: Blog posts with categories and authors
- **Categories**: Post categorization
- **Comments**: User comments on posts

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Prisma Documentation](https://www.prisma.io/docs) - database ORM documentation.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
