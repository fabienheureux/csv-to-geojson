import { useState } from "react";
import Papa from "papaparse";
import { csvToGeoJSON, detectCoordinateColumns } from "./utils/csvToGeojson";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/Card";
import { Button } from "./components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectPrimitive,
} from "./components/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/Tabs";
import { Alert, AlertDescription, AlertTitle } from "./components/Alert";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UploadIcon,
  DownloadIcon,
  ResetIcon,
  GearIcon,
  FileTextIcon,
  LayersIcon,
} from "@radix-ui/react-icons";

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

          const csvHeaders = results.meta.fields;
          setHeaders(csvHeaders);

          if (!showColumnConfig) {
            const detected = detectCoordinateColumns(csvHeaders);
            if (detected.latColumn && detected.lonColumn) {
              setColumnConfig(detected);
            } else {
              setShowColumnConfig(true);
              setLoading(false);
              setError(
                "Could not auto-detect coordinate columns. Please select them manually.",
              );
              return;
            }
          }

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <LayersIcon className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              CSV to GeoJSON
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert CSV files with coordinates to GeoJSON format. All processing
            happens in your browser - fast, secure, and private.
          </p>
        </div>

        {/* Main Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5" />
              Upload & Convert
            </CardTitle>
            <CardDescription>
              Select a CSV file with latitude and longitude columns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium"
              >
                CSV File
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="file-upload"
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-accent/50 transition-all"
                >
                  <FileTextIcon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to select CSV file"}
                  </span>
                </label>
              </div>
            </div>

            {/* Column Configuration */}
            {headers.length > 0 && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowColumnConfig(!showColumnConfig)}
                  className="w-full sm:w-auto"
                >
                  <GearIcon className="w-4 h-4 mr-2" />
                  {showColumnConfig ? "Hide" : "Configure"} Columns
                </Button>

                {showColumnConfig && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Latitude Column
                      </label>
                      <Select
                        value={columnConfig.latColumn}
                        onValueChange={(value) =>
                          setColumnConfig({ ...columnConfig, latColumn: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectPrimitive.Value placeholder="Select latitude column" />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Longitude Column
                      </label>
                      <Select
                        value={columnConfig.lonColumn}
                        onValueChange={(value) =>
                          setColumnConfig({ ...columnConfig, lonColumn: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectPrimitive.Value placeholder="Select longitude column" />
                        </SelectTrigger>
                        <SelectContent>
                          {headers.map((header) => (
                            <SelectItem key={header} value={header}>
                              {header}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleConvert}
                disabled={!file || loading}
                className="flex-1 sm:flex-initial"
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <LayersIcon className="w-4 h-4 mr-2" />
                    Convert to GeoJSON
                  </>
                )}
              </Button>

              {geojson && (
                <>
                  <Button onClick={handleDownload} variant="secondary">
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <ResetIcon className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </>
              )}
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <CrossCircledIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {stats && (
              <Alert variant="success">
                <CheckCircledIcon className="h-4 w-4" />
                <AlertTitle>Conversion Successful!</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Total rows:</span>
                      <span className="font-medium">{stats.totalRows}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Points exported:</span>
                      <span className="font-medium text-green-600">
                        {stats.exported}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Rows skipped:</span>
                      <span className="font-medium">{stats.skipped}</span>
                    </div>
                  </div>
                  {stats.errors.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium hover:underline">
                        View errors ({stats.errors.length})
                      </summary>
                      <ul className="mt-2 space-y-1 text-xs max-h-32 overflow-y-auto">
                        {stats.errors.slice(0, 10).map((err, idx) => (
                          <li key={idx} className="text-muted-foreground">
                            Line {err.line}: {err.message}
                          </li>
                        ))}
                        {stats.errors.length > 10 && (
                          <li className="text-muted-foreground font-medium">
                            ... and {stats.errors.length - 10} more
                          </li>
                        )}
                      </ul>
                    </details>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Preview */}
        {geojson && (
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Your GeoJSON output with {geojson.features.length} feature
                {geojson.features.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="formatted" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="formatted">Formatted</TabsTrigger>
                  <TabsTrigger value="compact">Compact</TabsTrigger>
                </TabsList>
                <TabsContent value="formatted" className="mt-4">
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(geojson, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="compact" className="mt-4">
                  <div className="bg-muted rounded-lg p-4 max-h-96 overflow-auto break-all">
                    <pre className="text-xs font-mono">
                      {JSON.stringify(geojson)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <CheckCircledIcon className="w-4 h-4" />
            No data is uploaded to any server. All processing happens in your
            browser.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
