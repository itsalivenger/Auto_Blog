'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Blog {
  _id?: string // MongoDB _id
  id?: string
  title: string
  content: string
  slug?: string
  published?: boolean
  featured?: boolean
  createdAt?: string
  author?: {
    id: string
    name: string
    email: string
  }
  images?: string[]
  published_at?: string
  source?: string
}

const PAGE_SIZE = 10

function allBlogsHaveSameImages(blogs: Blog[]): boolean {
  if (!blogs.length) return true;
  const first = JSON.stringify(blogs[0].images || []);
  return blogs.every(blog => JSON.stringify(blog.images || []) === first);
}

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalBlogsCount, setTotalBlogsCount] = useState(0)
  const [totalPublishedCount, setTotalPublishedCount] = useState(0)
  const [totalDraftsCount, setTotalDraftsCount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchBlogs(page)
    }
    // eslint-disable-next-line
  }, [user, authLoading, page, router])

  useEffect(() => {
    if (blogs.length > 0) {
      console.log('All blogs have same images:', allBlogsHaveSameImages(blogs));
    }
  }, [blogs]);

  const fetchBlogs = async (pageNum: number) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/blogs?limit=${PAGE_SIZE}&page=${pageNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setBlogs(data.data.blogs)
        setTotalPages(data.data.pagination.pages)
        setTotalBlogsCount(data.data.pagination.total)
        setTotalPublishedCount(data.data.pagination.totalPublished)
        setTotalDraftsCount(data.data.pagination.totalDrafts)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleDeleteClick = (blog: Blog) => {
    setBlogToDelete(blog)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!blogToDelete) return
    try {
      const token = localStorage.getItem('token')
      const id = blogToDelete._id || blogToDelete.id
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setDeleteDialogOpen(false)
        setBlogToDelete(null)
        fetchBlogs(page)
      } else {
        alert(data.error || 'Failed to delete blog')
      }
    } catch (error) {
      alert('Failed to delete blog')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBlogToDelete(null)
  }

  const handlePreview = (blog: Blog) => {
    const blogId = blog._id || blog.id;
    if (blogId) {
      const id = typeof blogId === 'object' ? (blogId as any).$oid : blogId;
      router.push(`/blog/${id}/review`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
        <div className="text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Auto Blog Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

        {/* Stats */}
      <div className="flex justify-center my-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
            <div className="text-lg font-bold text-gray-900">{totalBlogsCount}</div>
            <div className="text-sm text-gray-500 mt-1">Total Blogs</div>
            <div className="text-xs text-gray-400 mt-1 text-center">All blogs in your database, including drafts and published posts.</div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 flex flex-col items-center">
            <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
            <div className="text-lg font-bold text-gray-900">{totalPublishedCount}</div>
            <div className="text-sm text-gray-500 mt-1">Published</div>
            <div className="text-xs text-gray-400 mt-1 text-center">Blogs visible to the public.</div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg p-6 flex flex-col items-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
            <div className="text-lg font-bold text-gray-900">{totalDraftsCount}</div>
            <div className="text-sm text-gray-500 mt-1">Drafts</div>
            <div className="text-xs text-gray-400 mt-1 text-center">Blogs saved as drafts, not visible to the public.</div>
          </div>
        </div>
        </div>

        {/* Posts List */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {/* Pagination (Top) */}
        <div className="flex justify-center mt-6 mb-4 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-xs font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>

          <ul className="divide-y divide-gray-200">
            {blogs.map((blog, idx) => (
              <li key={blog._id || blog.id || idx}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center">
                    {/* Thumbnail */}
                    {blog.images && blog.images.length > 0 ? (
                      <img
                        src={blog.images[1] || blog.images[0]}
                        alt={`Thumbnail for ${blog.title}`}
                        className="w-16 h-16 object-cover rounded mr-4 border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded mr-4 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                    <div>
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ''} • {blog.source}
                      </div>
                      <div className="text-xs text-gray-700 line-clamp-2 max-w-xs">
                        {blog.content?.slice(0, 120)}{blog.content && blog.content.length > 120 ? '...' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold transition"
                      onClick={() => handlePreview(blog)}
                    >
                      Preview
                      </button>
                    <button className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold transition">Edit</button>
                    <button
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition"
                      onClick={() => handleDeleteClick(blog)}
                    >
                      Remove
                      </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-xs font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
          <div className="bg-white bg-opacity-90 rounded shadow-lg p-6 w-full max-w-xs animate-fadeInUp">
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold mb-2 text-black">Delete Blog</div>
              <div className="text-sm text-gray-600">Are you sure you want to delete <span className='font-bold'>{blogToDelete?.title}</span>?</div>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-semibold"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white text-sm font-semibold"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 