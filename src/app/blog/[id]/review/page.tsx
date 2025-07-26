'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { parseMongoDate, extractImageFromRSS } from '@/lib/utils'

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
  status?: 'draft' | 'published' | 'archived'
}

export default function BlogReviewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [improving, setImproving] = useState(false)
  const [improvedContent, setImprovedContent] = useState<string>('')
  const [showImproved, setShowImproved] = useState(false)
  const [improvementType, setImprovementType] = useState<'general' | 'seo' | null>(null)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishDate, setPublishDate] = useState('')
  const [publishTime, setPublishTime] = useState('')
  const [publishNow, setPublishNow] = useState(false)

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
      console.log('🔍 Review page fetching blog with ID:', params.id)
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch(`/api/blogs/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      console.log('🔍 Review page response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('🔍 Review page error:', errorData)
        throw new Error(`Failed to fetch blog: ${errorData.error || response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🔍 Review page blog data:', data)
      setBlog(data.data)
    } catch (error) {
      console.error('Error fetching blog:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleImproveWithAI = async () => {
    if (!blog) return
    
    try {
      setImproving(true)
      setImprovementType('general')
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: `title: ${blog.title} \n content: ${blog.content}`,
          type: 'general'
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to improve text')
      }
      
      const data = await response.json()
      console.log('AI improvement result:', data)
      
      // Update the improved content and show it
      setImprovedContent(data.improvedText)
      setShowImproved(true)
      
    } catch (error) {
      console.error('Error improving text with AI:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to improve text'}`)
    } finally {
      setImproving(false)
      setImprovementType(null)
    }
  }

  const handleImproveForSEO = async () => {
    if (!blog) return
    
    try {
      setImproving(true)
      setImprovementType('seo')
      
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/ai/improve', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: blog.content,
          type: 'seo'
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to improve text for SEO')
      }
      
      const data = await response.json()
      console.log('SEO improvement result:', data)
      
      // Update the improved content and show it
      setImprovedContent(data.improvedText)
      setShowImproved(true)
      
    } catch (error) {
      console.error('Error improving text for SEO:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to improve text for SEO'}`)
    } finally {
      setImproving(false)
      setImprovementType(null)
    }
  }

  const toggleContent = () => {
    setShowImproved(!showImproved)
  }

  const getCurrentContent = () => {
    if (showImproved && improvedContent) {
      return improvedContent
    }
    return blog?.content || ''
  }

  const getContentLabel = () => {
    if (showImproved && improvedContent) {
      return `AI Improved (${improvementType === 'general' ? 'General' : 'SEO'})`
    }
    return 'Original Content'
  }

  const handlePublish = async () => {
    if (!blog) return
    
    // Open the publish scheduling modal
    setShowPublishModal(true)
  }

  const handleConfirmPublish = async () => {
    if (!blog) {
      alert('No blog data available')
      return
    }
    
    if (!publishNow && (!publishDate || !publishTime)) {
      alert('Please select both date and time for publishing, or check "Publish Now"')
      return
    }
    
    try {
      console.log('Publishing blog:', { publishNow, publishDate, publishTime })
      
      const token = localStorage.getItem('token')
      const response = await fetch('/api/blogger/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blog: {
            ...blog,
            content: getCurrentContent() // Ensure we send the currently displayed content (original or AI-improved)
          },
          publishDate: publishNow ? new Date().toISOString().split('T')[0] : publishDate,
          publishTime: publishNow ? new Date().toISOString().split('T')[1].split('.')[0] : publishTime,
          publishNow
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to publish to Blogger')
      }
      
      const data = await response.json()
      console.log('Blogger publish result:', data)
      
      const message = publishNow 
        ? `Blog successfully published to Blogger!\n\nBlogger Post ID: ${data.bloggerPostId}\nBlogger Post URL: ${data.bloggerPostUrl}`
        : `Blog successfully scheduled for publication on Blogger!\n\nScheduled for: ${data.scheduledFor}\nBlogger Post ID: ${data.bloggerPostId}`
      
      alert(message)
      
      setShowPublishModal(false)
      setPublishDate('')
      setPublishTime('')
      setPublishNow(false)
      
    } catch (error) {
      console.error('Error publishing blog:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to publish blog'}`)
    }
  }

  const handleCancelPublish = () => {
    setShowPublishModal(false)
    setPublishDate('')
    setPublishTime('')
    setPublishNow(false)
  }

  const getStatusBadge = (status: string = 'draft') => {
    const statusConfig = {
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', text: 'Published' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archived' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${config.color}`}>
        {config.text}
      </span>
    )
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
              <h1 className="text-xl font-semibold text-gray-900">Blog Review</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Status and Publish Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-base font-medium text-gray-700">Status:</span>
            <div className="text-lg">
              {getStatusBadge(blog?.status)}
            </div>
          </div>
          <button
            onClick={handlePublish}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-md"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Publish Blog
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h3>
            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
              <span>Source: {blog.source}</span>
              <span>Published: {blog.published_at ? parseMongoDate(blog.published_at).toLocaleDateString() : 'Not published'}</span>
              <span>Created: {parseMongoDate(blog.created_at).toLocaleDateString()}</span>
            </div>
            <div className="mb-4 flex items-center space-x-4">
              <a 
                href={blog.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View Original Article →
              </a>
              
              {/* AI Improvement Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleImproveWithAI}
                  disabled={improving}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {improving && improvementType === 'general' ? 'Improving...' : 'Improve using AI'}
                </button>
                
                <button
                  onClick={handleImproveForSEO}
                  disabled={improving}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                  </svg>
                  {improving && improvementType === 'seo' ? 'Optimizing...' : 'Improve for SEO using AI'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Blog Images */}
          {(blog.images && blog.images.length > 0) && (
            <div className="px-4 py-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Blog Images</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blog.images.map((imageUrl, index) => (
                  <div key={index} className="flex justify-center">
                    <img
                      src={imageUrl}
                      alt={`${blog.title} - Image ${index + 1}`}
                      className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Fallback to RSS image if no stored images */}
          {(!blog.images || blog.images.length === 0) && (() => {
            const imageUrl = extractImageFromRSS(blog.original_rss_content)
            return imageUrl ? (
              <div className="px-4 py-4 border-b border-gray-200">
                <div className="flex justify-center">
                  <img
                    src={imageUrl}
                    alt={blog.title}
                    className="max-w-full h-auto max-h-96 object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              </div>
            ) : null
          })()}
          
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            {/* Content Toggle Header */}
            {improvedContent && (
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">
                    {getContentLabel()}
                  </span>
                  {showImproved && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      AI Improved
                    </span>
                  )}
                </div>
                <button
                  onClick={toggleContent}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch to {showImproved ? 'Original' : 'Improved'}
                </button>
              </div>
            )}
            
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {getCurrentContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Scheduling Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-8 border w-[500px] shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Schedule Publication</h3>
                <button
                  onClick={handleCancelPublish}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    id="publishDate"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    disabled={publishNow}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${publishNow ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label htmlFor="publishTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Time
                  </label>
                  <input
                    type="time"
                    id="publishTime"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    disabled={publishNow}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black ${publishNow ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="publishNow"
                    checked={publishNow}
                    onChange={(e) => setPublishNow(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="publishNow" className="text-sm text-gray-700">
                    Publish Now
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700">
                      The blog will be published at the selected date and time.
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelPublish}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPublish}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Confirm Publication
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 