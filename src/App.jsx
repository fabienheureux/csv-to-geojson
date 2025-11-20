import { useState } from "react";
import Papa from "papaparse";
import { csvToGeoJSON, detectCoordinateColumns } from "./utils/csvToGeojson";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [geojson, setGeojson] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [columnConfig, setColumnConfig] = useState({
    latColumn: "latitude",
    lonColumn: "longitude",
  });
  const [headers, setHeaders] = useState([]);
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setGeojson(null);
      setStats(null);
    }
  };

  const handleConvert = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          if (results.data.length === 0) {
            setError("CSV file is empty");
            setLoading(false);
            return;
          }

          // Get headers
          const csvHeaders = results.meta.fields;
          setHeaders(csvHeaders);

          // Auto-detect columns if not already configured
          if (!showColumnConfig) {
            const detected = detectCoordinateColumns(csvHeaders);
            if (detected.latColumn && detected.lonColumn) {
              setColumnConfig(detected);
            } else {
              // Show column configuration if auto-detection failed
              setShowColumnConfig(true);
              setLoading(false);
              setError(
                "Could not auto-detect coordinate columns. Please select them manually.",
              );
              return;
            }
          }

          // Check if columns exist
          if (!csvHeaders.includes(columnConfig.latColumn)) {
            setError(
              `Column "${columnConfig.latColumn}" not found in CSV. Available columns: ${csvHeaders.join(", ")}`,
            );
            setLoading(false);
            return;
          }

          if (!csvHeaders.includes(columnConfig.lonColumn)) {
            setError(
              `Column "${columnConfig.lonColumn}" not found in CSV. Available columns: ${csvHeaders.join(", ")}`,
            );
            setLoading(false);
            return;
          }

          // Convert to GeoJSON
          const result = csvToGeoJSON(
            results.data,
            columnConfig.latColumn,
            columnConfig.lonColumn,
          );

          setGeojson(result.geojson);
          setStats(result.stats);
          setLoading(false);
        } catch (err) {
          setError(`Conversion error: ${err.message}`);
          setLoading(false);
        }
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
        setLoading(false);
      },
    });
  };

  const handleDownload = () => {
    if (!geojson) return;

    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: "application/geo+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(".csv", ".geojson");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setFile(null);
    setGeojson(null);
    setStats(null);
    setError(null);
    setHeaders([]);
    setShowColumnConfig(false);
    setColumnConfig({ latColumn: "latitude", lonColumn: "longitude" });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>CSV to GeoJSON Converter</h1>
        <p>
          Convert CSV files with coordinates to GeoJSON format - 100%
          client-side
        </p>
      </header>

      <main className="main">
        <div className="upload-section">
          <div className="file-input-wrapper">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              id="file-input"
              className="file-input"
            />
            <label htmlFor="file-input" className="file-label">
              {file ? file.name : "Choose CSV file"}
            </label>
          </div>

          {headers.length > 0 && (
            <div className="column-config">
              <button
                onClick={() => setShowColumnConfig(!showColumnConfig)}
                className="config-toggle"
              >
                {showColumnConfig ? "Hide" : "Show"} Column Configuration
              </button>

              {showColumnConfig && (
                <div className="config-fields">
                  <div className="field">
                    <label htmlFor="lat-column">Latitude Column:</label>
                    <select
                      id="lat-column"
                      value={columnConfig.latColumn}
                      onChange={(e) =>
                        setColumnConfig({
                          ...columnConfig,
                          latColumn: e.target.value,
                        })
                      }
                    >
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="lon-column">Longitude Column:</label>
                    <select
                      id="lon-column"
                      value={columnConfig.lonColumn}
                      onChange={(e) =>
                        setColumnConfig({
                          ...columnConfig,
                          lonColumn: e.target.value,
                        })
                      }
                    >
                      {headers.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="button-group">
            <button
              onClick={handleConvert}
              disabled={!file || loading}
              className="btn btn-primary"
            >
              {loading ? "Converting..." : "Convert to GeoJSON"}
            </button>

            {geojson && (
              <>
                <button onClick={handleDownload} className="btn btn-success">
                  Download GeoJSON
                </button>
                <button onClick={handleReset} className="btn btn-secondary">
                  Reset
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="alert alert-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {stats && (
            <div className="alert alert-success">
              <h3>Conversion Successful!</h3>
              <ul>
                <li>Total rows: {stats.totalRows}</li>
                <li>Points exported: {stats.exported}</li>
                <li>Rows skipped: {stats.skipped}</li>
              </ul>
              {stats.errors.length > 0 && (
                <details>
                  <summary>View errors ({stats.errors.length})</summary>
                  <ul className="error-list">
                    {stats.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>
                        Line {err.line}: {err.message}
                      </li>
                    ))}
                    {stats.errors.length > 10 && (
                      <li>... and {stats.errors.length - 10} more</li>
                    )}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {geojson && (
          <div className="preview-section">
            <h2>GeoJSON Preview</h2>
            <div className="json-preview">
              <pre>{JSON.stringify(geojson, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>
          No data is uploaded to any server. All processing happens in your
          browser.
        </p>
      </footer>
    </div>
  );
}

export default App;
