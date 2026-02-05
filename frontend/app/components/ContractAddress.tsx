'use client'

import { useState } from 'react'

export default function ContractAddress() {
  const [copied, setCopied] = useState(false)
  const ca = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || ''

  const handleCopy = () => {
    if (!ca) return
    
    navigator.clipboard.writeText(ca)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!ca) {
    return <span className="text-gray-500">TBA</span>
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-gray-300 hover:text-white transition-colors font-mono break-all text-left group relative block"
      title="Click to copy"
    >
      {ca}
      {copied && (
        <span className="absolute -top-8 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  )
}
