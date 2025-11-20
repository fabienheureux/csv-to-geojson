/**
 * Convert CSV data to GeoJSON format
 * @param {Array} csvData - Parsed CSV data from PapaParse
 * @param {string} latColumn - Name of latitude column
 * @param {string} lonColumn - Name of longitude column
 * @returns {Object} GeoJSON object with features and skipped rows count
 */
export function csvToGeoJSON(csvData, latColumn = 'latitude', lonColumn = 'longitude') {
  const features = [];
  const errors = [];
  let skippedRows = 0;

  csvData.forEach((row, index) => {
    try {
      // Get latitude and longitude
      const latStr = row[latColumn]?.toString().trim();
      const lonStr = row[lonColumn]?.toString().trim();

      // Check if coordinates are present
      if (!latStr || !lonStr) {
        skippedRows++;
        return;
      }

      // Convert to float
      const latitude = parseFloat(latStr);
      const longitude = parseFloat(lonStr);

      // Check if coordinates are valid numbers
      if (isNaN(latitude) || isNaN(longitude)) {
        errors.push({
          line: index + 1,
          message: `Invalid coordinates: lat=${latStr}, lon=${lonStr}`
        });
        skippedRows++;
        return;
      }

      // Verify coordinates are within valid ranges
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        errors.push({
          line: index + 1,
          message: `Coordinates out of bounds: lat=${latitude}, lon=${longitude}`
        });
        skippedRows++;
        return;
      }

      // Create properties (all columns except lat/lon)
      const properties = {};
      Object.keys(row).forEach(key => {
        if (key !== latColumn && key !== lonColumn) {
          properties[key] = row[key];
        }
      });

      // Create GeoJSON feature
      const feature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude] // GeoJSON uses [lon, lat]
        },
        properties
      };

      features.push(feature);
    } catch (error) {
      errors.push({
        line: index + 1,
        message: error.message
      });
      skippedRows++;
    }
  });

  // Create GeoJSON object
  const geojson = {
    type: 'FeatureCollection',
    features
  };

  return {
    geojson,
    stats: {
      totalRows: csvData.length,
      exported: features.length,
      skipped: skippedRows,
      errors
    }
  };
}

/**
 * Detect latitude and longitude column names in CSV headers
 * @param {Array} headers - Array of column names
 * @returns {Object} Object with latColumn and lonColumn
 */
export function detectCoordinateColumns(headers) {
  const latPatterns = ['latitude', 'lat', 'y', 'Latitude', 'LAT', 'Lat'];
  const lonPatterns = ['longitude', 'lon', 'lng', 'x', 'Longitude', 'LON', 'Lon', 'Lng'];

  let latColumn = null;
  let lonColumn = null;

  // Try to find latitude column
  for (const pattern of latPatterns) {
    if (headers.includes(pattern)) {
      latColumn = pattern;
      break;
    }
  }

  // Try to find longitude column
  for (const pattern of lonPatterns) {
    if (headers.includes(pattern)) {
      lonColumn = pattern;
      break;
    }
  }

  return { latColumn, lonColumn };
}
