'use client'

import { useState } from 'react'

interface Blog {
  id: string
  title: string
  content: string
  slug: string
  published: boolean
  featured: boolean
  createdAt: string
  imageUrl?: string
  template?: string // add this line
  author: {
    id: string
    name: string
    email: string
  }
}

interface BlogViewProps {
  blog: Blog | null
  isOpen: boolean
  onClose: () => void
}

export default function BlogView({ blog, isOpen, onClose }: BlogViewProps) {
  if (!isOpen || !blog) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Template layouts
  const renderClassic = () => (
    <>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{blog.title}</h3>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>By {blog.author?.name || 'Unknown Author'}</span>
            <span>•</span>
            <span>{formatDate(blog.createdAt)}</span>
            {blog.featured && (
              <>
                <span>•</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Featured</span>
              </>
            )}
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              blog.published 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {blog.published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Image */}
      {blog.imageUrl && (
        <div className="mb-6">
          <img 
            src={blog.imageUrl} 
            alt={blog.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        </div>
      )}
      {/* Content */}
      <div className="prose max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </div>
    </>
  )

  const renderModern = () => (
    <>
      {/* Banner Image with overlayed title */}
      {blog.imageUrl && (
        <div className="relative mb-6">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-56 object-cover rounded-t-lg" />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
            <h3 className="text-3xl font-extrabold text-white drop-shadow mb-1">{blog.title}</h3>
            <div className="flex items-center text-xs text-gray-200 space-x-3">
              <span>By {blog.author?.name || 'Unknown Author'}</span>
              <span>•</span>
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>
        </div>
      )}
      {!blog.imageUrl && (
        <h3 className="text-3xl font-extrabold text-gray-900 mb-2">{blog.title}</h3>
      )}
      <div className="bg-white rounded-lg shadow p-6 -mt-8 relative z-10">
        <div className="flex items-center text-xs text-gray-500 space-x-3 mb-2">
          {blog.featured && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Featured</span>}
          <span className={`px-2 py-1 rounded-full text-xs ${blog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{blog.published ? 'Published' : 'Draft'}</span>
        </div>
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>
      </div>
    </>
  )

  const renderImageFocused = () => (
    <>
      {/* Large image at the top */}
      {blog.imageUrl && (
        <div className="mb-4">
          <img src={blog.imageUrl} alt={blog.title} className="w-full h-80 object-cover rounded-lg" />
        </div>
      )}
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{blog.title}</h3>
        <div className="flex items-center text-xs text-gray-500 space-x-2">
          <span>By {blog.author?.name || 'Unknown Author'}</span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
      <div className="prose max-w-none mx-auto">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </div>
    </>
  )

  const renderMinimal = () => (
    <>
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{blog.title}</h3>
        <div className="flex items-center text-xs text-gray-400 space-x-2">
          <span>By {blog.author?.name || 'Unknown Author'}</span>
          <span>•</span>
          <span>{formatDate(blog.createdAt)}</span>
        </div>
      </div>
      <div className="mx-auto max-w-xl">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
          {blog.content}
        </div>
      </div>
    </>
  )

  let content
  switch (blog.template) {
    case 'modern':
      content = renderModern()
      break
    case 'image':
      content = renderImageFocused()
      break
    case 'minimal':
      content = renderMinimal()
      break
    case 'classic':
    default:
      content = renderClassic()
      break
  }

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity z-[9998]" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle relative z-[9999]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                {content}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 