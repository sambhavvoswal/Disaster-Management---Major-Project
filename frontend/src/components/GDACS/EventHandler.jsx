import React, { useEffect, useMemo, useState } from 'react'
import { fetchDisasterData } from './DataCollector'
import DataLog from './DataLog'

const EventHandler = () => {
  const [selectedDisaster, setSelectedDisaster] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [disasterEvents, setDisasterEvents] = useState([])
  const [allEvents, setAllEvents] = useState([])

  const disasterTypes = [
    { code: 'EQ', meaning: 'Earthquake' },
    { code: 'TC', meaning: 'Tropical Cyclone' },
    { code: 'FL', meaning: 'Flood' },
    { code: 'VO', meaning: 'Volcano' },
    { code: 'DR', meaning: 'Drought' },
    { code: 'WF', meaning: 'Wildfire' }
  ]

  const handleFetchData = async () => {
    setLoading(true)
    setError('')
    setDisasterEvents([])

    try {
      if (selectedDisaster) {
        const data = await fetchDisasterData(selectedDisaster)
        setDisasterEvents(data)
        if (data.length === 0) {
          setError('No active disasters found for the selected type.')
        }
      } else {
        const results = await Promise.all(
          disasterTypes.map((d) => fetchDisasterData(d.code))
        )
        const merged = results.flat()
        setAllEvents(merged)
        if (merged.length === 0) {
          setError('No active disasters found.')
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
      setDisasterEvents([])
    } finally {
      setLoading(false)
    }
  }

  const availableCountries = useMemo(() => {
    const base = selectedDisaster
      ? (allEvents || []).filter((e) => e?.properties?.eventtype === selectedDisaster)
      : (allEvents || [])
    const set = new Set()
    base.forEach((e) => {
      const props = e?.properties || {}
      const c = props.country
      if (typeof c === 'string') {
        c.split(',').forEach((s) => s && set.add(s.trim()))
      } else if (Array.isArray(c)) {
        c.forEach((s) => s && set.add(String(s).trim()))
      }
      const ac = props.affectedcountries
      if (typeof ac === 'string') {
        ac.split(',').forEach((s) => s && set.add(s.trim()))
      } else if (Array.isArray(ac)) {
        ac.forEach((s) => s && set.add(String(s).trim()))
      }
    })
    const arr = Array.from(set).filter(Boolean).sort()
    return arr
  }, [allEvents, selectedDisaster])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.all(
          disasterTypes.map((d) => fetchDisasterData(d.code))
        )
        setAllEvents(results.flat())
      } catch (err) {
        setError(err.message || 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const fetchSelected = async () => {
      if (!selectedDisaster) {
        setDisasterEvents([])
        return
      }
      await handleFetchData()
    }
    fetchSelected()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDisaster])

  useEffect(() => {
    if (selectedCountry && !availableCountries.includes(selectedCountry)) {
      setSelectedCountry('')
    }
  }, [availableCountries, selectedCountry])

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Disaster Monitoring</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Disaster Type
          </label>
          <select
            value={selectedDisaster}
            onChange={(e) => setSelectedDisaster(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a disaster --</option>
            {disasterTypes.map((disaster) => (
              <option key={disaster.code} value={disaster.code}>
                {disaster.meaning} ({disaster.code})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- All Countries --</option>
            {availableCountries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleFetchData}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
        >
          {loading ? 'Fetching Data...' : 'Fetch Data'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

      {(() => {
        let base = allEvents || []
        if (selectedDisaster) {
          base = base.filter((e) => e?.properties?.eventtype === selectedDisaster)
        }
        if (selectedCountry) {
          base = base.filter((e) => {
            const props = e?.properties || {}
            const c = props.country
            const ac = props.affectedcountries
            const matchCountry = (val) => typeof val === 'string' && val.split(',').map((s) => s.trim()).includes(selectedCountry)
            const matchArray = (arr) => Array.isArray(arr) && arr.map((s) => String(s).trim()).includes(selectedCountry)
            return matchCountry(c) || matchArray(c) || matchCountry(ac) || matchArray(ac)
          })
        }
        return base && base.length > 0 ? <DataLog events={base} /> : null
      })()}
    </div>
  )
}

export default EventHandler