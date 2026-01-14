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

export default function Home() {
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 5 seconds')), 5000)
    })
    
    // Race between fetch and timeout
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
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Stablecoin Card Issuer Comparison
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Compare stablecoin credit card issuers by region, fees, KYC requirements, and more
        </p>
      </header>

      <form onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Country (required) *
            </label>
            <select
              required
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
              disabled={loadingMetadata || !metadata}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                opacity: loadingMetadata || !metadata ? 0.6 : 1,
                cursor: loadingMetadata || !metadata ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">
                {loadingMetadata ? 'Loading...' : !metadata ? 'No data available' : 'Select country'}
              </option>
              {metadata?.supported_countries?.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Network
            </label>
            <select
              value={formData.network}
              onChange={(e) => handleChange('network', e.target.value)}
              disabled={loadingMetadata || !metadata}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                opacity: loadingMetadata || !metadata ? 0.6 : 1,
                cursor: loadingMetadata || !metadata ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">Any</option>
              {metadata?.networks?.map((n) => (
                <option key={n} value={n}>
                  {n.charAt(0).toUpperCase() + n.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Customer Type
            </label>
            <select
              value={formData.customer_type}
              onChange={(e) => handleChange('customer_type', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              {metadata?.customer_types.map((ct) => (
                <option key={ct} value={ct}>
                  {ct.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Custody Model
            </label>
            <select
              value={formData.custody_model}
              onChange={(e) => handleChange('custody_model', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              {metadata?.custody_models.map((cm) => (
                <option key={cm} value={cm}>
                  {cm.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Stablecoin
            </label>
            <select
              value={formData.stablecoin}
              onChange={(e) => handleChange('stablecoin', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              {metadata?.stablecoins.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Chain
            </label>
            <select
              value={formData.chain}
              onChange={(e) => handleChange('chain', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              {metadata?.chains.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              KYC Requirement
            </label>
            <select
              value={formData.kyc}
              onChange={(e) => handleChange('kyc', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              <option value="required">Required</option>
              <option value="optional">Optional</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Card Type
            </label>
            <select
              value={formData.card_type}
              onChange={(e) => handleChange('card_type', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
              }}
            >
              <option value="">Any</option>
              {metadata?.card_types.map((ct) => (
                <option key={ct} value={ct}>
                  {ct.charAt(0).toUpperCase() + ct.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || loadingMetadata || !metadata}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || loadingMetadata || !metadata ? 'not-allowed' : 'pointer',
            opacity: loading || loadingMetadata || !metadata ? 0.6 : 1,
          }}
        >
          {loading ? 'Comparing...' : loadingMetadata ? 'Loading...' : !metadata ? 'Waiting for API...' : 'Compare Issuers'}
        </button>
      </form>

      {loadingMetadata && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '4px',
            color: '#1565c0',
            marginBottom: '2rem',
          }}
        >
          Loading metadata from API...
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c00',
            marginBottom: '2rem',
          }}
        >
          <strong>Error:</strong> {error}
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            To fix this:
            <ol style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
              <li>Make sure the API server is running: <code>npm run dev:api</code></li>
              <li>Check that the API is accessible at: <code>{API_URL}</code></li>
              <li>Try opening <a href={`${API_URL}/health`} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>{API_URL}/health</a> in your browser</li>
            </ol>
          </div>
        </div>
      )}

      {!loadingMetadata && !metadata && !error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
            marginBottom: '2rem',
          }}
        >
          No metadata loaded. Please check the API connection.
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 style={{ marginBottom: '1.5rem' }}>Comparison Results</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {results.map((result) => (
              <div
                key={result.issuer.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      <a
                        href={result.issuer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0070f3', textDecoration: 'none' }}
                      >
                        {result.issuer.name}
                      </a>
                    </h3>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      Score: <strong>{result.score}/100</strong>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#888' }}>
                      Roles: {result.issuer.roles.join(', ')} | Networks:{' '}
                      {result.issuer.networks.join(', ')} | Custody:{' '}
                      {result.issuer.custody_model}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: result.score >= 70 ? '#cfc' : result.score >= 50 ? '#ffc' : '#fcc',
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {result.score}%
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Why this matched:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    {result.reasons.map((reason, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        {reason.message} <span style={{ color: '#666' }}>(+{reason.score})</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.missing.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#c00' }}>
                      Missing requirements:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                      {result.missing.map((miss, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem', fontSize: '0.9rem', color: '#c00' }}>
                          {miss}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Stablecoins:</strong> {result.issuer.stablecoins.join(', ') || 'None'}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Chains:</strong> {result.issuer.chains.join(', ') || 'None'}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Card Types:</strong> {result.issuer.card_types.join(', ')}
                  </div>
                  <div style={{ marginBottom: '0.25rem' }}>
                    <strong>Customer Types:</strong> {result.issuer.customer_type.join(', ')}
                  </div>
                  {result.issuer.notes && (
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                      {result.issuer.notes}
                    </div>
                  )}
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>Confidence:</strong> {result.issuer.confidence} |{' '}
                    <strong>API Maturity:</strong> {result.issuer.api_maturity}/5 |{' '}
                    <strong>Docs Quality:</strong> {result.issuer.docs_quality}/5
                  </div>
                  {result.issuer.sources.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>Sources:</strong>{' '}
                      {result.issuer.sources.map((src, idx) => (
                        <span key={idx}>
                          <a
                            href={src}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#0070f3' }}
                          >
                            {idx + 1}
                          </a>
                          {idx < result.issuer.sources.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
