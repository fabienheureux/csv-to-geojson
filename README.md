# CSV to GeoJSON Converter

A web application that converts CSV files containing coordinates (latitude, longitude) to GeoJSON format. All processing happens client-side in your browser - no data is sent to any server.

## Features

- 100% client-side processing (no server uploads required)
- Auto-detection of latitude/longitude columns
- Manual column selection when auto-detection fails
- Real-time conversion with progress feedback
- GeoJSON preview
- Download converted GeoJSON file
- Error reporting for invalid coordinates
- Responsive design for mobile and desktop

## Usage

1. Click "Choose CSV file" and select your CSV file
2. The app will auto-detect latitude and longitude columns
3. If auto-detection fails, manually select the correct columns
4. Click "Convert to GeoJSON"
5. Review the conversion results and any errors
6. Click "Download GeoJSON" to save the file

## CSV Format Requirements

Your CSV file should contain:
- A header row with column names
- At least two columns for coordinates (latitude and longitude)
- Valid coordinate values:
  - Latitude: -90 to 90
  - Longitude: -180 to 180

### Example CSV

```csv
name,latitude,longitude,description
Point 1,48.8566,2.3522,Paris
Point 2,51.5074,-0.1278,London
Point 3,40.7128,-74.0060,New York
```

### Supported Column Names

The app automatically detects these column names:
- **Latitude**: `latitude`, `lat`, `y`, `Latitude`, `LAT`, `Lat`
- **Longitude**: `longitude`, `lon`, `lng`, `x`, `Longitude`, `LON`, `Lon`, `Lng`

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to GitHub Pages

### Automatic Deployment with GitHub Actions

This project is configured to automatically deploy to GitHub Pages when you push to the `main` branch.

#### Setup Steps

1. **Create a GitHub repository** and push this code to it

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "GitHub Actions"

3. **Update the base path** (if your repository name is different from `csv-to-geojson`):
   - Edit `vite.config.js`
   - Change `base: '/csv-to-geojson/'` to `base: '/your-repo-name/'`

4. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

5. **Wait for deployment**:
   - Go to the "Actions" tab in your repository
   - Watch the deployment workflow complete
   - Your app will be live at `https://your-username.github.io/your-repo-name/`

### Manual Deployment

You can also deploy manually:

```bash
npm run build
# Then upload the contents of the dist folder to your hosting provider
```

## Technologies Used

- **React** - UI framework
- **Vite** - Build tool and development server
- **PapaParse** - CSV parsing library
- **JavaScript** - CSV to GeoJSON conversion (client-side, no WASM needed for this simple conversion)

## Why Client-Side?

This app processes everything in your browser for several reasons:
- **Privacy**: Your data never leaves your device
- **Speed**: No network latency for uploads/downloads
- **Simplicity**: No backend infrastructure required
- **Cost**: Free to host on GitHub Pages

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
