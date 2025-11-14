import React, { useEffect, useState } from 'react'
import { fetchDisasterData } from './DataCollector'
import DataLog from './DataLog'

const EventHandler = () => {
  const [selectedDisaster, setSelectedDisaster] = useState('')
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
        let visibleEvents
        if (selectedDisaster) {
          visibleEvents = disasterEvents && disasterEvents.length > 0
            ? disasterEvents
            : (allEvents || []).filter((e) => e?.properties?.eventtype === selectedDisaster)
        } else {
          visibleEvents = allEvents
        }
        return visibleEvents && visibleEvents.length > 0 ? <DataLog events={visibleEvents} /> : null
      })()}
    </div>
  )
}

export default EventHandler