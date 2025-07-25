'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { parseMongoDate } from '@/lib/utils'

interface Blog {
  _id: string | {
    $oid: string
  }
  title: string
  url: string
  content: string
  published_at: {
    $date: string
  }
  source: string
  created_at: {
    $date: string
  }
  content_length: number
  excerpt: string
  original_rss_content: string
  images?: string[]
}

export default function BlogEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    images: [] as string[]
  })
  const [newImageUrl, setNewImageUrl] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchBlog()
  }, [user, authLoading, router, params.id])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/blogs/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Failed to fetch blog')
      }
      const data = await response.json()
      setBlog(data.blog)
      setFormData({
        title: data.blog.title,
        content: data.blog.content,
        excerpt: data.blog.excerpt,
        images: data.blog.images || []
      })
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      console.log('Saving blog with data:', formData)
      
      const response = await fetch(`/api/blogs/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to update blog: ${errorData.error || response.statusText}`)
      }
      
      const result = await response.json()
      console.log('Blog updated successfully:', result)
      
      // Show success message before redirecting
      alert('Blog updated successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error updating blog:', error)
      alert(`Error updating blog: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const addImage = () => {
    const trimmedUrl = newImageUrl.trim()
    
    if (!trimmedUrl) {
      alert('Please enter an image URL')
      return
    }
    
    // Basic URL validation
    try {
      new URL(trimmedUrl)
    } catch {
      alert('Please enter a valid URL')
      return
    }
    
    if (formData.images.includes(trimmedUrl)) {
      alert('This image URL has already been added')
      return
    }
    
    setFormData({
      ...formData,
      images: [...formData.images, trimmedUrl]
    })
    setNewImageUrl('')
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    })
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Blog not found</div>
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
              <button
                onClick={handleBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Edit Blog</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Blog Post</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Source: {blog.source} • Created: {parseMongoDate(blog.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="space-y-8">
              <div>
                <label htmlFor="title" className="block text-lg font-semibold text-gray-900 mb-2">
                  Blog Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-black bg-white px-4 py-3"
                  placeholder="Enter the blog title..."
                />
              </div>
              
              <div>
                <label htmlFor="excerpt" className="block text-lg font-semibold text-gray-900 mb-2">
                  Blog Excerpt
                </label>
                <textarea
                  id="excerpt"
                  rows={4}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-black bg-white px-4 py-3"
                  placeholder="Enter a brief excerpt of the blog..."
                />
              </div>
              
              <div>
                <label htmlFor="content" className="block text-lg font-semibold text-gray-900 mb-2">
                  Blog Content
                </label>
                <textarea
                  id="content"
                  rows={20}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-black bg-white px-4 py-3"
                  placeholder="Enter the full blog content..."
                />
              </div>

              {/* Image Management */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Blog Images
                </label>
                <div className="space-y-6">
                  {/* Add Image Input */}
                  <div className="flex space-x-3">
                    <input
                      type="url"
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base text-black bg-white px-4 py-3"
                    />
                    <button
                      type="button"
                      onClick={addImage}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
                    >
                      Add Image
                    </button>
                  </div>
                  
                  {/* Display Images */}
                  {formData.images.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} added
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {formData.images.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`Blog image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg shadow-md"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-lg"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 