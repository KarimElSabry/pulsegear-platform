// src/app/admin/leads/LeadsClient.tsx

'use client'

import { useState } from 'react'
import LeadCard from './LeadCard'

type Tab = 'all' | 'reservations' | 'requests'
type FilterStatus = 'all' | 'new' | 'pending' | 'contacted' | 'converted' | 'lost'

export default function LeadsClient({
  initialReservations,
  initialRequests,
}: {
  initialReservations: any[]
  initialRequests: any[]
}) {
  const [reservations, setReservations] = useState(initialReservations)
  const [requests, setRequests] = useState(initialRequests)
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const updateReservation = (id: number, updates: any) => {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const updateRequest = (id: number, updates: any) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  // Combine & filter
  const allLeads = [
    ...reservations.map((r) => ({ ...r, _source: 'reservation' as const })),
    ...requests.map((r) => ({ ...r, _source: 'request' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const displayed =
    activeTab === 'all'
      ? allLeads
      : activeTab === 'reservations'
      ? allLeads.filter((l) => l._source === 'reservation')
      : allLeads.filter((l) => l._source === 'request')

  const filtered =
    filterStatus === 'all'
      ? displayed
      : displayed.filter((l) => l.status === filterStatus)

  // Stats
  const stats = {
    total: allLeads.length,
    new: allLeads.filter((l) => l.status === 'new' || l.status === 'pending').length,
    contacted: allLeads.filter((l) => l.status === 'contacted').length,
    converted: allLeads.filter((l) => l.status === 'converted').length,
    lost: allLeads.filter((l) => l.status === 'lost').length,
  }

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All Leads', count: allLeads.length },
    { key: 'reservations', label: 'Reservations', count: reservations.length },
    { key: 'requests', label: 'Product Requests', count: requests.length },
  ]

  const statusFilters: { key: FilterStatus; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'bg-zinc-700 text-white' },
    { key: 'pending', label: 'Pending', color: 'bg-yellow-500 text-black' },
    { key: 'new', label: 'New', color: 'bg-blue-500 text-white' },
    { key: 'contacted', label: 'Contacted', color: 'bg-purple-500 text-white' },
    { key: 'converted', label: 'Converted', color: 'bg-green-500 text-white' },
    { key: 'lost', label: 'Lost', color: 'bg-red-500 text-white' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads', value: stats.total, color: 'text-white' },
          { label: 'Need Action', value: stats.new, color: 'text-yellow-400' },
          { label: 'Contacted', value: stats.contacted, color: 'text-purple-400' },
          { label: 'Converted', value: stats.converted, color: 'text-green-400' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center"
          >
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-zinc-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === tab.key
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition ${
              filterStatus === f.key
                ? f.color
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Leads List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-bold">No leads found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <LeadCard
              key={`${lead._source}-${lead.id}`}
              lead={lead}
              onUpdate={(updates: Record<string, any>) =>
                lead._source === 'reservation'
                  ? updateReservation(lead.id, updates)
                  : updateRequest(lead.id, updates)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}