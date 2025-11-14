import React, { useState } from 'react'
import { fetchDisasterData } from './DataCollector'
import DataLog from './DataLog'

const EventHandler = () => {
  const [selectedDisaster, setSelectedDisaster] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [disasterEvents, setDisasterEvents] = useState([])

  const disasterTypes = [
    { code: 'EQ', meaning: 'Earthquake' },
    { code: 'TC', meaning: 'Tropical Cyclone' },
    { code: 'FL', meaning: 'Flood' },
    { code: 'VO', meaning: 'Volcano' },
    { code: 'DR', meaning: 'Drought' },
    { code: 'WF', meaning: 'Wildfire' }
  ]

  const handleFetchData = async () => {
    if (!selectedDisaster) {
      setError('Please select a disaster type')
      return
    }

    setLoading(true)
    setError('')
    setDisasterEvents([])

    try {
      const data = await fetchDisasterData(selectedDisaster)
      setDisasterEvents(data)
      if (data.length === 0) {
        setError('No active disasters found for the selected type.')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
      setDisasterEvents([])
    } finally {
      setLoading(false)
    }
  }

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

      {disasterEvents.length > 0 && (
        <DataLog events={disasterEvents} />
      )}
    </div>
  )
}

export default EventHandler