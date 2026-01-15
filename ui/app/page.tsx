'use client'

import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'

interface Metadata {
  roles: string[]
  networks: string[]
  card_types: string[]
  customer_types: string[]
  custody_models: string[]
  funding_sources: string[]
  stablecoins: string[]
  chains: string[]
  kyc_kyb_options: string[]
  confidence_levels: string[]
  supported_countries: string[]
}

interface MatchReason {
  type: string
  message: string
  score: number
}

interface Issuer {
  id: string
  name: string
  website: string
  roles: string[]
  networks: string[]
  card_types: string[]
  regions_supported: Array<{ code: string; notes?: string }>
  customer_type: string[]
  custody_model: string
  funding_sources: string[]
  stablecoins: string[]
  chains: string[]
  kyc_kyb: string
  pricing_model: string[]
  api_maturity: number
  docs_quality: number
  confidence: string
  notes: string
  sources: string[]
}

interface ComparisonResult {
  issuer: Issuer
  score: number
  reasons: MatchReason[]
  missing: string[]
}

interface CompareResponse {
  matches: ComparisonResult[]
  query: any
}

const getCardColor = (name: string) => {
  const colors: { [key: string]: string } = {
    'Nexo': '#1a1a1a',
    'Coinbase': '#0052ff',
    'Binance': '#f0b90b',
    'Crypto.com': '#103f68',
    'Bybit': '#1a1a1a',
    'KAST': '#8b5cf6',
    'Gemini': '#2a2a2a',
    'ConsenSys': '#f97316',
  }
  return colors[name] || '#131a33'
}

const getTextColor = (name: string) => {
  const lightText = ['Nexo', 'Crypto.com', 'Bybit', 'Gemini']
  return lightText.includes(name) ? '#ffffff' : '#000000'
}

export default function Home() {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeNav, setActiveNav] = useState('discover')
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)

  const [formData, setFormData] = useState({
    country: '',
    network: '',
    customer_type: '',
    custody_model: '',
    stablecoin: '',
    chain: '',
    kyc: '',
    card_type: '',
  })

  useEffect(() => {
    setLoadingMetadata(true)
    
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 5 seconds')), 5000)
    })
    
    Promise.race([
      fetch(`${API_URL}/metadata`),
      timeoutPromise
    ])
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        setMetadata(data)
        setError(null)
      })
      .catch((err) => {
        console.error('Failed to load metadata:', err)
        let errorMessage = ''
        if (err.message === 'Request timeout after 5 seconds') {
          errorMessage = `API request timed out. The API at ${API_URL} is not responding. Make sure it's running.`
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          errorMessage = `Cannot connect to API at ${API_URL}. Make sure the API server is running (npm run dev:api).`
        } else {
          errorMessage = `Failed to load metadata from API. Make sure the API is running on ${API_URL}. Error: ${err.message}`
        }
        setError(errorMessage)
      })
      .finally(() => {
        setLoadingMetadata(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.country) {
      setError('Country is required')
      return
    }

    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    Object.entries(formData).forEach(([key, value]) => {
      if (value) params.append(key, value)
    })

    try {
      const res = await fetch(`${API_URL}/compare?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to compare')
      }
      const data: CompareResponse = await res.json()
      setResults(data.matches)
    } catch (err: any) {
      setError(err.message || 'Failed to compare issuers')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Auto-submit when filters change
    if (field === 'country' && value) {
      setTimeout(() => {
        const form = document.querySelector('form') as HTMLFormElement
        if (form) form.requestSubmit()
      }, 100)
    }
  }

  const filteredResults = results.filter(result => 
    searchQuery === '' || 
    result.issuer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    result.issuer.networks.some(n => n.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div 
      style={{ display: 'flex', minHeight: '100vh', width: '100%' }}
      onClick={() => setShowRegionDropdown(false)}
    >
      {/* Left Sidebar */}
      <aside style={{
        width: '280px',
        minHeight: '100vh',
        background: '#0a0f24',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              position: 'absolute',
              top: '4px',
              left: '4px',
            }} />
            <div style={{
              width: '12px',
              height: '12px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              position: 'absolute',
              bottom: '4px',
              right: '4px',
            }} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: '#ffffff',
          }}>
            CryptoCards
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveNav('discover')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: activeNav === 'discover' ? '#1a1f3a' : 'transparent',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeNav !== 'discover') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeNav !== 'discover') {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="4" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="12" y="4" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="4" y="12" width="4" height="4" rx="1" fill="currentColor" />
              <rect x="12" y="12" width="4" height="4" rx="1" fill="currentColor" />
            </svg>
            Discover Cards
          </button>

          <button
            onClick={() => setActiveNav('comparison')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: activeNav === 'comparison' ? '#1a1f3a' : 'transparent',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeNav !== 'comparison') {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }
            }}
            onMouseLeave={(e) => {
              if (activeNav !== 'comparison') {
                e.currentTarget.style.background = 'transparent'
              }
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="6" width="8" height="8" rx="1" fill="currentColor" opacity="0.5" />
              <rect x="10" y="2" width="8" height="8" rx="1" fill="currentColor" />
            </svg>
            Comparison
          </button>

          <button
            onClick={() => setActiveNav('find')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'transparent',
              border: 'none',
              borderRadius: '0.75rem',
              color: '#10b981',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12 8H18L13 12L15 18L10 14L5 18L7 12L2 8H8L10 2Z" fill="currentColor" />
            </svg>
            Find My Card
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '2rem 3rem',
        overflowY: 'auto',
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '2rem',
        }}>
          Explore Cards
        </h1>

        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '1.5rem',
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9ca3af',
            }}
          >
            <path d="M9 3C5.686 3 3 5.686 3 9C3 12.314 5.686 15 9 15C10.657 15 12.156 14.328 13.242 13.242L16.293 16.293C16.683 16.683 17.317 16.683 17.707 16.293C18.098 15.902 18.098 15.269 17.707 14.879L14.656 11.828C15.328 10.742 16 9.243 16 7.586C16 4.272 13.314 1.586 10 1.586H9V3ZM9 5C12.314 5 15 7.686 15 11C15 14.314 12.314 17 9 17C5.686 17 3 14.314 3 11C3 7.686 5.686 5 9 5Z" fill="currentColor" />
          </svg>
          <input
            type="text"
            placeholder="Search by issuer, perk, or network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              background: '#131a33',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '0.75rem',
              fontSize: '1rem',
              color: '#ffffff',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            }}
          />
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1rem',
                background: formData.country ? '#1a1f3a' : '#131a33',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 1V3M8 13V15M15 8H13M3 8H1M13.071 2.929L11.657 4.343M4.343 11.657L2.929 13.071M13.071 13.071L11.657 11.657M4.343 4.343L2.929 2.929" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              {formData.country || 'All Regions'}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {showRegionDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                background: '#131a33',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '0.75rem',
                padding: '0.5rem',
                minWidth: '200px',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              }}>
                <button
                  onClick={() => {
                    handleChange('country', '')
                    setShowRegionDropdown(false)
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.625rem 0.75rem',
                    background: !formData.country ? '#1a1f3a' : 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    marginBottom: '0.25rem',
                  }}
                >
                  All Regions
                </button>
                {metadata?.supported_countries?.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      handleChange('country', code)
                      setShowRegionDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.625rem 0.75rem',
                      background: formData.country === code ? '#1a1f3a' : 'transparent',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      marginBottom: '0.25rem',
                    }}
                    onMouseEnter={(e) => {
                      if (formData.country !== code) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (formData.country !== code) {
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {code}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#131a33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1V15M1 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Any Currency
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#131a33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="7" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 7V5C5 3.343 6.343 2 8 2C9.657 2 11 3.343 11 5V7" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Any Privacy
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button style={{
            padding: '0.625rem 1rem',
            background: formData.custody_model === 'non-custodial' ? '#1a1f3a' : '#131a33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            handleChange('custody_model', formData.custody_model === 'non-custodial' ? '' : 'non-custodial')
          }}
          >
            Non-Custodial
          </button>

          <button style={{
            padding: '0.625rem 1rem',
            background: formData.custody_model === 'self-custody' ? '#1a1f3a' : '#131a33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            handleChange('custody_model', formData.custody_model === 'self-custody' ? '' : 'self-custody')
          }}
          >
            Self-Custody
          </button>

          <div style={{ flex: 1 }} />

          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#131a33',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0.75rem',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s ease',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L10.09 6.26L14.91 7.09L11.45 10.18L12.18 15L8 12.77L3.82 15L4.55 10.18L1.09 7.09L5.91 6.26L8 2Z" fill="currentColor" />
            </svg>
            All
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Hidden Filter Form */}
        <form onSubmit={handleSubmit} style={{ display: 'none' }}>
          {[
            { key: 'country', label: 'Country', required: true },
            { key: 'network', label: 'Network', required: false },
            { key: 'customer_type', label: 'Customer Type', required: false },
            { key: 'custody_model', label: 'Custody Model', required: false },
            { key: 'stablecoin', label: 'Stablecoin', required: false },
            { key: 'chain', label: 'Chain', required: false },
            { key: 'kyc', label: 'KYC Requirement', required: false },
            { key: 'card_type', label: 'Card Type', required: false },
          ].map(({ key, label, required }) => (
            key === 'country' ? (
              <select
                key={key}
                required={required}
                value={formData[key as keyof typeof formData]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={loadingMetadata || !metadata}
                style={{ display: 'block', marginBottom: '1rem' }}
              >
                <option value="">Select country</option>
                {metadata?.supported_countries?.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            ) : null
          ))}
        </form>

        {/* Error Messages */}
        {error && (
          <div style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.75rem',
            color: '#fca5a5',
            marginBottom: '2rem',
          }}>
            {error}
          </div>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
            Loading...
          </div>
        ) : filteredResults.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {filteredResults.map((result) => {
              const cardColor = getCardColor(result.issuer.name)
              const textColor = getTextColor(result.issuer.name)
              const cardNumber = String(Math.floor(Math.random() * 9000) + 1000)
              const hasVisa = result.issuer.networks.some(n => n.toLowerCase().includes('visa'))
              const hasMastercard = result.issuer.networks.some(n => n.toLowerCase().includes('mastercard'))

              return (
                <div
                  key={result.issuer.id}
                  style={{
                    aspectRatio: '1.586 / 1',
                    background: cardColor,
                    borderRadius: '1rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                  }}
                  onClick={() => window.open(result.issuer.website, '_blank')}
                >
                  {/* Top Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: textColor,
                        marginBottom: '0.25rem',
                      }}>
                        {result.issuer.name}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: textColor,
                        opacity: 0.7,
                      }}>
                        {result.issuer.custody_model}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // Add to comparison logic
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: 'none',
                        color: textColor,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Middle - Chip */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginTop: 'auto',
                    marginBottom: 'auto',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        right: '4px',
                        bottom: '4px',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
                        borderRadius: '2px',
                      }} />
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                  }}>
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: textColor,
                        letterSpacing: '0.1em',
                        marginBottom: '0.25rem',
                      }}>
                        .... {cardNumber}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: textColor,
                        opacity: 0.7,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        CARD HOLDER
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      {hasVisa && (
                        <div style={{
                          fontSize: '1.25rem',
                          fontWeight: '700',
                          color: textColor,
                          letterSpacing: '0.05em',
                        }}>
                          VISA
                        </div>
                      )}
                      {hasMastercard && (
                        <div style={{
                          width: '40px',
                          height: '24px',
                          background: textColor === '#ffffff' ? '#eb001b' : '#000000',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: textColor === '#ffffff' ? '#ff5f00' : '#ffffff',
                            position: 'absolute',
                            right: '-8px',
                          }} />
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: textColor === '#ffffff' ? '#eb001b' : '#000000',
                            position: 'absolute',
                            left: '-8px',
                          }} />
                        </div>
                      )}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: textColor, opacity: 0.7 }}>
                        <path d="M12 2L13.09 8.26L19.91 9.09L14.45 13.18L15.18 18L12 15.77L8.82 18L9.55 13.18L4.09 9.09L10.91 8.26L12 2Z" fill="currentColor" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : results.length === 0 && !loadingMetadata ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#9ca3af',
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>No cards found</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Select a country to start exploring cards</p>
          </div>
        ) : null}
      </main>
    </div>
  )
}
