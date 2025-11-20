import { useState } from "react";
import Papa from "papaparse";
import { csvToGeoJSON, detectCoordinateColumns } from "./utils/csvToGeojson";
import { MapPreview } from "./components/MapPreview";
import {
  Theme,
  Container,
  Card,
  Flex,
  Box,
  Text,
  Button,
  Select,
  Tabs,
  Callout,
  Heading,
  Badge,
  IconButton,
  Separator,
} from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  UploadIcon,
  DownloadIcon,
  ResetIcon,
  GearIcon,
  FileTextIcon,
  LayersIcon,
  InfoCircledIcon,
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
    <Theme accentColor="purple" grayColor="slate" radius="large" scaling="100%">
      <Box
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(to bottom right, var(--purple-2), var(--blue-2))",
          padding: "var(--space-4)",
        }}
      >
        <Container size="3">
          {/* Header */}
          <Flex direction="column" align="center" gap="4" mb="8" mt="6">
            <Flex align="center" gap="3">
              <LayersIcon
                width="48"
                height="48"
                style={{ color: "var(--purple-9)" }}
              />
              <Heading
                size="9"
                style={{
                  background:
                    "linear-gradient(to right, var(--purple-9), var(--blue-9))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CSV to GeoJSON
              </Heading>
            </Flex>
            <Text
              size="4"
              color="gray"
              align="center"
              style={{ maxWidth: "600px" }}
            >
              Convert CSV files with coordinates to GeoJSON format. All
              processing happens in your browser - fast, secure, and private.
            </Text>
          </Flex>

          {/* Main Card */}
          <Card size="4" mb="4">
            <Flex direction="column" gap="4">
              <Flex align="center" gap="2">
                <UploadIcon width="20" height="20" />
                <Heading size="5">Upload & Convert</Heading>
              </Flex>

              <Text size="2" color="gray">
                Select a CSV file with latitude and longitude columns
              </Text>

              {/* File Upload */}
              <Box>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  id="file-upload"
                  style={{ display: "none" }}
                />
                <label htmlFor="file-upload">
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "var(--space-2)",
                      padding: "var(--space-6)",
                      border: "2px dashed var(--gray-7)",
                      borderRadius: "var(--radius-4)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      backgroundColor: "var(--color-panel)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--purple-8)";
                      e.currentTarget.style.backgroundColor = "var(--purple-2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--gray-7)";
                      e.currentTarget.style.backgroundColor =
                        "var(--color-panel)";
                    }}
                  >
                    <FileTextIcon width="20" height="20" />
                    <Text size="2" color="gray">
                      {file ? file.name : "Click to select CSV file"}
                    </Text>
                  </Box>
                </label>
              </Box>

              {/* Column Configuration */}
              {headers.length > 0 && (
                <Flex direction="column" gap="3">
                  <Button
                    variant="soft"
                    onClick={() => setShowColumnConfig(!showColumnConfig)}
                    style={{ width: "fit-content" }}
                  >
                    <GearIcon />
                    {showColumnConfig ? "Hide" : "Configure"} Columns
                  </Button>

                  {showColumnConfig && (
                    <Card variant="surface">
                      <Flex direction="column" gap="4">
                        <Box>
                          <Text as="label" size="2" weight="bold" mb="1">
                            Latitude Column
                          </Text>
                          <Select.Root
                            value={columnConfig.latColumn}
                            onValueChange={(value) =>
                              setColumnConfig({
                                ...columnConfig,
                                latColumn: value,
                              })
                            }
                          >
                            <Select.Trigger style={{ width: "100%" }} />
                            <Select.Content>
                              {headers.map((header) => (
                                <Select.Item key={header} value={header}>
                                  {header}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>

                        <Box>
                          <Text as="label" size="2" weight="bold" mb="1">
                            Longitude Column
                          </Text>
                          <Select.Root
                            value={columnConfig.lonColumn}
                            onValueChange={(value) =>
                              setColumnConfig({
                                ...columnConfig,
                                lonColumn: value,
                              })
                            }
                          >
                            <Select.Trigger style={{ width: "100%" }} />
                            <Select.Content>
                              {headers.map((header) => (
                                <Select.Item key={header} value={header}>
                                  {header}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Root>
                        </Box>
                      </Flex>
                    </Card>
                  )}
                </Flex>
              )}

              {/* Action Buttons */}
              <Flex gap="3" wrap="wrap">
                <Button
                  size="3"
                  onClick={handleConvert}
                  disabled={!file || loading}
                  style={{ flex: "1 1 auto" }}
                >
                  <LayersIcon />
                  {loading ? "Processing..." : "Convert to GeoJSON"}
                </Button>

                {geojson && (
                  <>
                    <Button size="3" onClick={handleDownload} variant="soft">
                      <DownloadIcon />
                      Download
                    </Button>
                    <Button size="3" onClick={handleReset} variant="outline">
                      <ResetIcon />
                      Reset
                    </Button>
                  </>
                )}
              </Flex>

              {/* Error Alert */}
              {error && (
                <Callout.Root color="red">
                  <Callout.Icon>
                    <CrossCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <Text weight="bold">Error</Text>
                    <Text as="div" size="2">
                      {error}
                    </Text>
                  </Callout.Text>
                </Callout.Root>
              )}

              {/* Success Alert */}
              {stats && (
                <Callout.Root color="green">
                  <Callout.Icon>
                    <CheckCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <Flex direction="column" gap="2">
                      <Text weight="bold">Conversion Successful!</Text>
                      <Flex direction="column" gap="1">
                        <Flex justify="between">
                          <Text size="2">Total rows:</Text>
                          <Badge color="gray">{stats.totalRows}</Badge>
                        </Flex>
                        <Flex justify="between">
                          <Text size="2">Points exported:</Text>
                          <Badge color="green">{stats.exported}</Badge>
                        </Flex>
                        <Flex justify="between">
                          <Text size="2">Rows skipped:</Text>
                          <Badge color="orange">{stats.skipped}</Badge>
                        </Flex>
                      </Flex>
                      {stats.errors.length > 0 && (
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              fontSize: "var(--font-size-2)",
                            }}
                          >
                            View errors ({stats.errors.length})
                          </summary>
                          <Flex
                            direction="column"
                            gap="1"
                            mt="2"
                            style={{
                              maxHeight: "120px",
                              overflowY: "auto",
                              fontSize: "var(--font-size-1)",
                            }}
                          >
                            {stats.errors.slice(0, 10).map((err, idx) => (
                              <Text key={idx} size="1" color="gray">
                                Line {err.line}: {err.message}
                              </Text>
                            ))}
                            {stats.errors.length > 10 && (
                              <Text size="1" weight="bold" color="gray">
                                ... and {stats.errors.length - 10} more
                              </Text>
                            )}
                          </Flex>
                        </details>
                      )}
                    </Flex>
                  </Callout.Text>
                </Callout.Root>
              )}
            </Flex>
          </Card>

          {/* Preview */}
          {geojson && (
            <Card size="4">
              <Flex direction="column" gap="4">
                <Flex align="center" justify="between">
                  <Heading size="5">Preview</Heading>
                  <Badge size="2" color="purple">
                    {geojson.features.length} feature
                    {geojson.features.length !== 1 ? "s" : ""}
                  </Badge>
                </Flex>

                <Tabs.Root defaultValue="map">
                  <Tabs.List>
                    <Tabs.Trigger value="map">Map</Tabs.Trigger>
                    <Tabs.Trigger value="formatted">Formatted</Tabs.Trigger>
                    <Tabs.Trigger value="compact">Compact</Tabs.Trigger>
                  </Tabs.List>

                  <Box pt="3">
                    <Tabs.Content value="map">
                      <MapPreview geojson={geojson} />
                    </Tabs.Content>

                    <Tabs.Content value="formatted">
                      <Card variant="surface">
                        <Box
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            fontFamily: "monospace",
                            fontSize: "12px",
                          }}
                        >
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(geojson, null, 2)}
                          </pre>
                        </Box>
                      </Card>
                    </Tabs.Content>

                    <Tabs.Content value="compact">
                      <Card variant="surface">
                        <Box
                          style={{
                            maxHeight: "400px",
                            overflowY: "auto",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            wordBreak: "break-all",
                          }}
                        >
                          <pre style={{ margin: 0 }}>
                            {JSON.stringify(geojson)}
                          </pre>
                        </Box>
                      </Card>
                    </Tabs.Content>
                  </Box>
                </Tabs.Root>
              </Flex>
            </Card>
          )}

          {/* Footer */}
          <Flex align="center" justify="center" gap="2" mt="8" mb="4">
            <InfoCircledIcon />
            <Text size="2" color="gray">
              No data is uploaded to any server. All processing happens in your
              browser.
            </Text>
          </Flex>
        </Container>
      </Box>
    </Theme>
  );
}

export default App;
