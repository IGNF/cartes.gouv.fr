import { useMemo, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Container, Alert, AlertTitle, Button } from "@mui/material";

import Main from "@/components/Layout/Main";
import { QuotaCheckSnapshot } from "./types";
import {
    transformEndpointTrends,
    transformStorageTrends,
    getEndpointSummaries,
    getStorageSummaries,
    getQuotaDataTimeSpan,
    formatFullTimestamp,
} from "./quotaChartUtils";
import KPICards from "./KPICards";
import EndpointsTrendChart from "./EndpointsTrendChart";
import StorageTrendChart from "./StorageTrendChart";
import StorageProgressSection from "./StorageProgressSection";
import EndpointsDetailTable from "./EndpointsDetailTable";
import FileUploadStep from "./FileUploadStep";

export default function DatastoreQuotaChecker() {
    const [loadedData, setLoadedData] = useState<QuotaCheckSnapshot[] | null>(null);
    const { endpointTrends, storageTrends, endpointSummaries, storageSummaries, timeSpan, latestSnapshot } = useMemo(() => {
        const snapshots = loadedData;

        if (!snapshots || snapshots.length === 0) {
            return {
                endpointTrends: [],
                storageTrends: [],
                endpointSummaries: [],
                storageSummaries: [],
                timeSpan: null,
                latestSnapshot: null,
            };
        }

        const endpointTrends = transformEndpointTrends(snapshots, 8);
        const storageTrends = transformStorageTrends(snapshots);
        const endpointSummaries = getEndpointSummaries(snapshots);
        const storageSummaries = getStorageSummaries(snapshots);
        const timeSpan = getQuotaDataTimeSpan(snapshots);
        const latestSnapshotTime = snapshots[snapshots.length - 1]?.timestamp ? formatFullTimestamp(snapshots[snapshots.length - 1].timestamp) : null;

        return {
            endpointTrends,
            storageTrends,
            endpointSummaries,
            storageSummaries,
            timeSpan,
            latestSnapshot: latestSnapshotTime,
        };
    }, [loadedData]);

    // Show file upload if no data loaded
    if (!loadedData) {
        return (
            <Main title="Quota Checker">
                <FileUploadStep onDataLoaded={setLoadedData} />
            </Main>
        );
    }

    if (!endpointTrends.length && !storageTrends.length) {
        return (
            <Main title="Quota Checker">
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    <Box sx={{ mb: 3 }}>
                        <Alert severity="warning">
                            <AlertTitle>No Data Available</AlertTitle>
                            No quota data snapshots found in the uploaded file.
                        </Alert>
                    </Box>
                    <Button variant="outlined" onClick={() => setLoadedData(null)} sx={{ mb: 2, color: "#000091", borderColor: "#000091" }}>
                        <i className="ri-upload-line" style={{ marginRight: 8 }} />
                        Upload Different File
                    </Button>
                </Container>
            </Main>
        );
    }

    return (
        <Main title="Quota Checker">
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    <h1 className={fr.cx("fr-mt-0")}>Quota Checker</h1>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setLoadedData(null)}
                        sx={{
                            color: "#000091",
                            borderColor: "#000091",
                            textTransform: "none",
                        }}
                    >
                        <i className="ri-upload-line" style={{ marginRight: 8 }} />
                        Upload Different File
                    </Button>
                </Box>

                {/* Data Time Span Info */}
                {timeSpan && (
                    <Box sx={{ mb: 3, p: 2, backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
                        <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
                            Data spanning {timeSpan.duration} • From {timeSpan.start} to {timeSpan.end}
                        </p>
                    </Box>
                )}

                {/* KPI Cards */}
                <KPICards
                    topEndpoints={endpointSummaries}
                    storages={storageSummaries}
                    totalEndpoints={endpointSummaries.length}
                    latestSnapshot={latestSnapshot ?? undefined}
                />

                {/* Charts */}
                <Box className={fr.cx("fr-mb-4w")}>
                    <EndpointsTrendChart data={endpointTrends} />
                </Box>

                <Box className={fr.cx("fr-mb-4w")}>
                    <StorageTrendChart data={storageTrends} />
                </Box>

                {/* Storage Details */}
                <Box className={fr.cx("fr-mb-4w")}>
                    <StorageProgressSection storages={storageSummaries} />
                </Box>

                {/* Endpoints Table */}
                <Box className={fr.cx("fr-mb-4w")}>
                    <EndpointsDetailTable endpoints={endpointSummaries} />
                </Box>
            </Container>
        </Main>
    );
}
