'use client'

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface ChartProps {
  data: Array<{
    date: string
    probability: number
    total: number
  }>
  yesPercentage: number
  noPercentage: number
  totalPredictions: number
  closesAt: string
}

export default function ProbabilityChart({ data, yesPercentage, noPercentage, totalPredictions, closesAt }: ChartProps) {
  return (
    <div className="p-6 rounded-xl bg-white/5 border border-white/10 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-4xl font-bold text-green-500">{yesPercentage}%</div>
          <div className="text-sm text-gray-500">YES probability</div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-red-500">{noPercentage}%</div>
          <div className="text-sm text-gray-500">NO probability</div>
        </div>
      </div>
      
      {/* Dynamic Chart */}
      {data.length > 1 && (
        <div className="h-64 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                stroke="#666"
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                domain={[0, 100]}
                tick={{ fill: '#999' }}
                label={{ value: 'YES %', angle: -90, position: 'insideLeft', fill: '#999' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                labelStyle={{ color: '#999' }}
                formatter={(value: any) => [`${value}%`, 'YES Probability']}
              />
              <Line 
                type="monotone" 
                dataKey="probability" 
                stroke="#f97316" 
                strokeWidth={3}
                dot={{ fill: '#f97316', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="flex h-4 rounded-full overflow-hidden bg-white/5">
        <div className="bg-green-500" style={{ width: `${yesPercentage}%` }} />
        <div className="bg-red-500" style={{ width: `${noPercentage}%` }} />
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <span>👥 {totalPredictions} predictions</span>
        {data.length > 0 && <span>📊 {data.length} data points</span>}
        <span>Closes: {new Date(closesAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}