// src/utils/disasterApi.js
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const fetchEarthquakes = async () => {
  try {
    // USGS API supports CORS, so we can call it directly
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');

    if (!response.ok) {
      throw new Error(`USGS API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.features || [];
  } catch (error) {
    console.error('Error fetching earthquakes:', error);
    return [];
  }
};

// In disasterApi.js
// In disasterApi.js, replace the fetchGDACSEvents function with this version
export const fetchGDACSEvents = async () => {
  try {
    console.log('Fetching GDACS data...');

    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);

    // Using the GDACS API endpoint with search parameters
    const apiUrl = new URL('https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH');

    // Add search parameters
    const params = {
      limit: 100,
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      alertlevel: 'red,orange,green',
      eventtype: 'TC,EQ,FL,VO,DR,WF,VO,TS'
    };

    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      apiUrl.searchParams.append(key, value);
    });

    // Try different CORS proxies in sequence
    const proxies = [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://corsproxy.io/?'
    ];

    let lastError;

    for (const proxy of proxies) {
      try {
        const proxyUrl = proxy === 'https://corsproxy.io/?'
          ? `${proxy}${encodeURIComponent(apiUrl.toString())}`
          : `${proxy}${apiUrl.toString()}`;

        console.log(`Trying proxy: ${proxy}`);
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.features)) {
          throw new Error('Invalid response format from GDACS API');
        }

        console.log('Event types received:', [...new Set(data.features.map(f => f.properties?.eventtype))]);

        // Process the GeoJSON features
        // In disasterApi.js, update the events processing section (around line 80-120)
        const events = data.features
          .map((feature, index) => {
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];
            const eventDate = props.fromdate ? new Date(props.fromdate) : new Date();

            // Skip events older than 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (eventDate < thirtyDaysAgo) {
              return null; // Skip this event
            }

            // Determine alert level based on alertscore
            const alertScore = parseFloat(props.alertscore) || 0;
            let alertLevel = 'green';
            if (alertScore >= 0.7) alertLevel = 'red';
            else if (alertScore >= 0.4) alertLevel = 'orange';

            return {
              id: `gdacs-${props.eventid || index}`,
              type: (props.eventtype || '').toLowerCase() || 'other',
              name: props.name || `GDACS Event ${index + 1}`,
              description: props.description || '',
              country: props.country || 'Unknown',
              region: props.region || 'Global',
              fromdate: props.fromdate || new Date().toISOString(),
              todate: props.todate || null,
              alertlevel: alertLevel,
              alertscore: alertScore,
              severity: props.severity || 0,
              severityText: props.severitytext || '',
              severityUnit: props.severityunit || '',
              lat: coords[1],
              lon: coords[0],
              url: props.url || `https://www.gdacs.org/`,
              hasValidCoords: coords.length >= 2 &&
                typeof coords[0] === 'number' &&
                typeof coords[1] === 'number',
              _raw: feature
            };
          })
          .filter(event => event && event.hasValidCoords); // Filter out nulls and invalid coords

        console.log(`Processed ${events.length} GDACS events from the last 30 days`);
        return events;

      } catch (error) {
        console.warn(`Proxy ${proxy} failed:`, error.message);
        lastError = error;
        // Try the next proxy
        continue;
      }
    }

    // If we get here, all proxies failed
    throw lastError || new Error('All CORS proxies failed');

  } catch (error) {
    console.error('Error fetching GDACS events:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return []; // Return empty array on error
  }
};

export const fetchCyclones = async () => {
  try {
    // Using alternative data source for cyclones from NHC
    const response = await fetch(`${CORS_PROXY}${encodeURIComponent('https://www.nhc.noaa.gov/gtwo.xml')}`);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const cyclones = [];
    const items = xml.getElementsByTagName('item');

    for (let item of items) {
      try {
        const title = item.getElementsByTagName('title')[0]?.textContent || 'Unnamed Cyclone';
        const description = item.getElementsByTagName('description')[0]?.textContent || '';

        // Extract position from description
        const positionMatch = description.match(/(\d+\.\d+[NS]\s+\d+\.\d+[EW])/);

        if (positionMatch) {
          const [lat, lon] = positionMatch[0].split(' ');
          cyclones.push({
            name: title.replace('Tropical Weather Outlook', '').trim(),
            position: positionMatch[0],
            lat: parseLatLon(lat, 'lat'),
            lon: parseLatLon(lon, 'lon'),
            description: description.replace(/<[^>]*>?/gm, '') // Remove HTML tags
          });
        }
      } catch (cycloneError) {
        console.warn('Error processing cyclone data:', cycloneError);
      }
    }

    return cyclones;
  } catch (error) {
    console.error('Error fetching cyclones:', error);
    return [];
  }
};

// Helper function to parse latitude/longitude strings
function parseLatLon(value, type) {
  if (!value) return 0;

  const direction = value.slice(-1).toUpperCase();
  const number = parseFloat(value.slice(0, -1));

  if (isNaN(number)) {
    console.warn(`Invalid ${type} value:`, value);
    return 0;
  }

  let result = number;
  if ((type === 'lat' && direction === 'S') || (type === 'lon' && direction === 'W')) {
    result = -result;
  }

  // Ensure valid range
  if (type === 'lat' && (result < -90 || result > 90)) {
    console.warn(`Invalid ${type} value (out of range):`, value, result);
    return 0;
  }
  if (type === 'lon' && (result < -180 || result > 180)) {
    console.warn(`Invalid ${type} value (out of range):`, value, result);
    return 0;
  }

  return parseFloat(result.toFixed(6)); // Return with reasonable precision
}

// Sample GDACS events data fallback
function getSampleGDACSEvents() {
  console.log('Using sample GDACS data');
  return [
    {
      id: 'sample-1',
      type: 'TC',
      name: 'Cyclone Sample',
      description: 'Tropical cyclone approaching coastal region',
      country: 'Sample Country',
      region: 'Pacific',
      fromdate: new Date().toISOString(),
      todate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      alertlevel: 'red',
      alertscore: 0.8,
      severity: 4,
      severityText: 'Category 4',
      severityUnit: 'Category',
      lat: 15.0,
      lon: 145.0,
      url: 'https://www.gdacs.org/',
      hasValidCoords: true,
      _raw: { isSample: true }
    },
    {
      id: 'sample-2',
      type: 'EQ',
      name: 'Earthquake Sample',
      description: 'Strong earthquake in sample region',
      country: 'Sample Country',
      region: 'Asia',
      fromdate: new Date().toISOString(),
      todate: null,
      alertlevel: 'orange',
      alertscore: 0.6,
      severity: 6.5,
      severityText: 'Magnitude 6.5',
      severityUnit: 'M',
      lat: 35.0,
      lon: 100.0,
      url: 'https://www.gdacs.org/',
      hasValidCoords: true,
      _raw: { isSample: true }
    },
    {
      id: 'sample-3',
      type: 'FL',
      name: 'Flood Sample',
      description: 'Major flooding reported in the region',
      country: 'Sample Country',
      region: 'Sample Region',
      fromdate: new Date().toISOString(),
      todate: null,
      alertlevel: 'red',
      alertscore: 0.8,
      severity: 3.5,
      severityText: 'Severe',
      severityUnit: 'm',
      lat: -15.0,
      lon: 30.0,
      url: 'https://www.gdacs.org/',
      hasValidCoords: true,
      _raw: { isSample: true }
    }
  ];
}