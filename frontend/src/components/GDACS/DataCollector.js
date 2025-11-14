/**
 * Fetches disaster data from GDACS API
 * @param {string} disasterCode - The disaster code (EQ, TC, FL, VO, DR, WF)
 * @returns {Promise<Array>} - Filtered array of events with alertscore 2 or 3
 */
export const fetchDisasterData = async (disasterCode) => {
  try {
    const apiUrl = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventtype=${disasterCode}`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Filter events: keep only those with alertscore 2 or 3
    const filteredEvents = filterEventsByAlertScore(data)
    
    return filteredEvents
  } catch (error) {
    console.error('Error fetching disaster data:', error)
    throw new Error(`Failed to fetch ${disasterCode} data: ${error.message}`)
  }
}

/**
 * Filters events to keep only those with alertscore 2 or 3
 * @param {Object} data - The API response object
 * @returns {Array} - Filtered features array
 */
const filterEventsByAlertScore = (data) => {
  if (!data || !data.features || !Array.isArray(data.features)) {
    return []
  }
  
  return data.features.filter((feature) => {
    const alertScore = feature.properties?.alertscore
    return alertScore === 2 || alertScore === 3
  })
}

/**
 * Extracts prominent properties from an event for display
 * @param {Object} feature - A feature object from the API response
 * @returns {Object} - Object with prominent properties
 */
export const extractEventDetails = (feature) => {
  const props = feature.properties || {}
  
  return {
    eventId: props.eventid,
    eventName: props.eventname,
    eventType: props.eventtype,
    alertLevel: props.alertlevel,
    alertScore: props.alertscore,
    description: props.description,
    country: props.country,
    affectedCountries: props.affectedcountries || [],
    fromDate: props.fromdate,
    toDate: props.todate,
    severity: props.severitydata?.severity,
    severityText: props.severitydata?.severitytext,
    icon: props.iconoverall,
    url: props.url?.report,
    coordinates: feature.geometry?.coordinates || []
  }
}
