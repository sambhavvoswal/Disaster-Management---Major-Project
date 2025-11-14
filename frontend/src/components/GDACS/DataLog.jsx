import React from 'react'
import { extractEventDetails } from './DataCollector'

/**
 * EventCard - Reusable component to display individual disaster event
 */
const EventCard = ({ event }) => {
  const details = extractEventDetails(event)
  
  const getAlertColor = (alertLevel) => {
    switch (alertLevel?.toLowerCase()) {
      case 'red':
        return 'bg-red-100 border-red-400 text-red-900'
      case 'orange':
        return 'bg-orange-100 border-orange-400 text-orange-900'
      case 'yellow':
        return 'bg-yellow-100 border-yellow-400 text-yellow-900'
      case 'green':
        return 'bg-green-100 border-green-400 text-green-900'
      default:
        return 'bg-gray-100 border-gray-400 text-gray-900'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-lg ${getAlertColor(details.alertLevel)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{details.eventName}</h3>
          <p className="text-sm opacity-75">{details.description}</p>
        </div>
        {details.icon && (
          <img 
            src={details.icon} 
            alt={details.eventType} 
            className="w-12 h-12 ml-4"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <span className="font-semibold">Alert Level:</span>
          <p>{details.alertLevel} (Score: {details.alertScore})</p>
        </div>
        <div>
          <span className="font-semibold">Location:</span>
          <p>{details.country}</p>
        </div>
        <div>
          <span className="font-semibold">Start Date:</span>
          <p>{formatDate(details.fromDate)}</p>
        </div>
        <div>
          <span className="font-semibold">End Date:</span>
          <p>{formatDate(details.toDate)}</p>
        </div>
      </div>

      {details.severityText && (
        <div className="bg-white bg-opacity-50 p-2 rounded mb-3 text-sm">
          <span className="font-semibold">Severity:</span> {details.severityText}
        </div>
      )}

      {details.affectedCountries.length > 0 && (
        <div className="text-sm mb-3">
          <span className="font-semibold">Affected Countries:</span>
          <p>{details.affectedCountries.map(c => c.countryname).join(', ')}</p>
        </div>
      )}

      {details.url && (
        <a
          href={details.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          View Full Report
        </a>
      )}
    </div>
  )
}

/**
 * DataLog - Reusable component to display all disaster events
 */
const DataLog = ({ events = [] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-600">No disaster events found. Select a disaster type and fetch data to see results.</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Active Disasters ({events.length})
      </h2>
      <div className="space-y-2">
        {events.map((event, index) => (
          <EventCard key={event.properties?.eventid || index} event={event} />
        ))}
      </div>
    </div>
  )
}

export default DataLog
export { EventCard }