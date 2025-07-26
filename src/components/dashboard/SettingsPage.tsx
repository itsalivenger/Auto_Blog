'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface Settings {
  postInterval: number
  automationEnabled: boolean
  sources: { id: string, url: string }[]
}

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
    postInterval: 60,
    automationEnabled: true,
    sources: []
  })
  const [loading, setLoading] = useState(true)
  const [newSourceUrl, setNewSourceUrl] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    fetchSettings()
  }, [user, authLoading, router])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to fetch settings')
      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })
      if (!response.ok) throw new Error('Failed to save settings')
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save settings'}`)
    }
  }

  const handleAddSource = async () => {
    if (!newSourceUrl.trim()) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ url: newSourceUrl }),
      })
      if (!response.ok) throw new Error('Failed to add source')
      const data = await response.json()
      setSettings(prev => ({
        ...prev,
        sources: [...prev.sources, data.source]
      }))
      setNewSourceUrl('')
      alert('Source added successfully!')
    } catch (error) {
      console.error('Error adding source:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to add source'}`)
    }
  }

  const handleRemoveSource = async (sourceId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/sources/${sourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error('Failed to remove source')
      setSettings(prev => ({
        ...prev,
        sources: prev.sources.filter(s => s.id !== sourceId)
      }))
      alert('Source removed successfully!')
    } catch (error) {
      console.error('Error removing source:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to remove source'}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Automation Settings</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="postInterval" className="block text-sm font-medium text-gray-700">Post Interval (minutes)</label>
              <input
                type="number"
                id="postInterval"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                value={settings.postInterval}
                onChange={(e) => setSettings({ ...settings, postInterval: parseInt(e.target.value) })}
                min="1"
              />
            </div>

            <div className="flex items-center">
              <input
                id="automationEnabled"
                name="automationEnabled"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                checked={settings.automationEnabled}
                onChange={(e) => setSettings({ ...settings, automationEnabled: e.target.checked })}
              />
              <label htmlFor="automationEnabled" className="ml-2 block text-sm text-gray-900">
                Enable Automation
              </label>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Manage Sources</h3>
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                  placeholder="Add new RSS feed URL"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                />
                <button
                  onClick={handleAddSource}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Source
                </button>
              </div>

              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                {settings.sources.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-gray-500">No sources added yet.</li>
                ) : (
                  settings.sources.map((source) => (
                    <li key={source.id} className="px-4 py-3 flex items-center justify-between">
                      <span className="text-sm text-gray-900 truncate pr-4">{source.url}</span>
                      <button
                        onClick={() => handleRemoveSource(source.id)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
