'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resolution_criteria: '',
    resolution_source: '',
    closes_at: '',
    resolves_at: '',
    category: 'crypto'
  })
  
  const [adminKey, setAdminKey] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Creating...')
    
    if (!adminKey) {
      setMessage('❌ Admin key required')
      return
    }
    
    try {
      // Convert datetime-local to ISO format
      const payload = {
        ...formData,
        closes_at: formData.closes_at ? new Date(formData.closes_at).toISOString() : '',
        resolves_at: formData.resolves_at ? new Date(formData.resolves_at).toISOString() : ''
      }
      
      const res = await fetch(`https://api.clawhub.com/v1/events/admin/create?admin_key=${encodeURIComponent(adminKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        setMessage('✅ Event created!')
        setFormData({
          title: '',
          description: '',
          resolution_criteria: '',
          resolution_source: '',
          closes_at: '',
          resolves_at: '',
          category: 'crypto'
        })
      } else {
        setMessage('❌ Error: ' + await res.text())
      }
    } catch (err) {
      setMessage('❌ Error: ' + err)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Admin Panel - Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <label className="block text-sm font-medium mb-2 text-orange-500">Admin Key *</label>
            <input
              type="password"
              required
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              placeholder="Enter admin key..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              placeholder="Will BTC hit $150K by June 2026?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg h-24"
              placeholder="Bitcoin reaching $150,000..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resolution Criteria *</label>
            <input
              type="text"
              required
              value={formData.resolution_criteria}
              onChange={(e) => setFormData({...formData, resolution_criteria: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              placeholder="BTC price >= $150,000 on CoinGecko"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Resolution Source</label>
            <input
              type="url"
              value={formData.resolution_source}
              onChange={(e) => setFormData({...formData, resolution_source: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              placeholder="https://coingecko.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Closes At *</label>
              <input
                type="datetime-local"
                required
                value={formData.closes_at}
                onChange={(e) => setFormData({...formData, closes_at: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Resolves At *</label>
              <input
                type="datetime-local"
                required
                value={formData.resolves_at}
                onChange={(e) => setFormData({...formData, resolves_at: e.target.value})}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
            >
              <option value="crypto">Crypto</option>
              <option value="politics">Politics</option>
              <option value="tech">Tech</option>
              <option value="sports">Sports</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-8 py-4 bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold"
          >
            Create Event
          </button>

          {message && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
