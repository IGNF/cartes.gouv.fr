import { useState } from "react";
import { Alert, Box, Button, Card, CardContent, Typography } from "@mui/material";

import { QuotaCheckSnapshot } from "./types";

interface FileUploadStepProps {
    onDataLoaded: (data: QuotaCheckSnapshot[]) => void;
}

export default function FileUploadStep({ onDataLoaded }: FileUploadStepProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const validateAndLoadFile = (file: File) => {
        setLoading(true);
        setError(null);

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                const data = JSON.parse(content);

                // Basic validation: ensure it's an array
                if (!Array.isArray(data)) {
                    throw new Error("Invalid format: JSON file must contain an array of quota snapshots");
                }

                // Validate structure: check first item has required fields
                if (data.length > 0) {
                    const firstItem = data[0];
                    if (!firstItem.timestamp || !firstItem.data || !firstItem.data.endpoints || !firstItem.data.storages) {
                        throw new Error("Invalid format: snapshots must contain 'timestamp', 'data.endpoints', and 'data.storages'");
                    }
                }

                // Type assertion - user has provided valid JSON
                const typedData = data as QuotaCheckSnapshot[];
                onDataLoaded(typedData);
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to parse JSON file";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file");
            setLoading(false);
        };

        reader.readAsText(file);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndLoadFile(files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            validateAndLoadFile(files[0]);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "300px",
                padding: 3,
            }}
        >
            <Card sx={{ maxWidth: 500, width: "100%" }}>
                <CardContent>
                    <Typography
                        variant="h5"
                        sx={{
                            marginBottom: 2,
                            fontWeight: 600,
                            color: "#000091",
                        }}
                    >
                        Upload Quota Data
                    </Typography>

                    <Typography sx={{ marginBottom: 3, color: "textSecondary" }}>
                        Upload a JSON file containing quota check snapshots to visualize the data.
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ marginBottom: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        sx={{
                            border: "2px dashed",
                            borderColor: dragActive ? "#000091" : "#ccc",
                            borderRadius: 2,
                            padding: 4,
                            textAlign: "center",
                            backgroundColor: dragActive ? "#f0f0f0" : "white",
                            transition: "all 0.3s ease",
                            cursor: "pointer",
                            marginBottom: 2,
                            "&:hover": {
                                borderColor: "#000091",
                                backgroundColor: "#f9f9f9",
                            },
                        }}
                    >
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileInput}
                            style={{
                                display: "none",
                            }}
                            id="file-input"
                            disabled={loading}
                        />
                        <label
                            htmlFor="file-input"
                            style={{
                                cursor: loading ? "not-allowed" : "pointer",
                                display: "block",
                            }}
                        >
                            <i
                                className="ri-upload-cloud-2-line"
                                style={{
                                    fontSize: "48px",
                                    color: "#000091",
                                    display: "block",
                                    marginBottom: "8px",
                                }}
                            />
                            <Typography sx={{ fontWeight: 600, marginBottom: 1 }}>Drag and drop a JSON file here</Typography>
                            <Typography variant="body2" sx={{ color: "textSecondary" }}>
                                or click to select a file
                            </Typography>
                        </label>
                    </Box>

                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        disabled={loading}
                        sx={{
                            backgroundColor: "#000091",
                            "&:hover": { backgroundColor: "#0000c0" },
                        }}
                    >
                        {loading ? "Loading..." : "Select File"}
                        <input type="file" accept=".json" onChange={handleFileInput} hidden disabled={loading} />
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
