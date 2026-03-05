import { Box, Card, CardContent, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import { StorageSummary } from "./types";
import { getColorForPercentage, formatNumber } from "./quotaChartUtils";

interface StorageProgressSectionProps {
    storages: StorageSummary[];
}

export default function StorageProgressSection({ storages }: StorageProgressSectionProps) {
    if (!storages || storages.length === 0) {
        return (
            <Card sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <CardContent>
                    <Typography color="textSecondary">No storage data available</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.08)", marginBottom: 3 }}>
            <CardContent>
                <Typography
                    sx={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        marginBottom: 3,
                        color: "#000091",
                    }}
                >
                    Storage Utilization
                </Typography>

                {/* Progress Bars */}
                <Box sx={{ marginBottom: 4 }}>
                    {storages.map((storage) => {
                        const color = getColorForPercentage(storage.percentage);
                        return (
                            <Box key={storage.name} sx={{ marginBottom: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: 1,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {storage.name}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color,
                                        }}
                                    >
                                        {storage.percentage.toFixed(1)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(storage.percentage, 100)}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: "#f0f0f0",
                                        "& .MuiLinearProgress-bar": {
                                            backgroundColor: color,
                                            borderRadius: 4,
                                        },
                                    }}
                                />
                                <Typography
                                    sx={{
                                        fontSize: "0.75rem",
                                        color: "textSecondary",
                                        marginTop: 0.5,
                                    }}
                                >
                                    {formatNumber(storage.latestUsage)} MB / {formatNumber(storage.latestQuota)} MB
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>

                {/* Detailed Table */}
                <Typography
                    sx={{
                        fontSize: "0.975rem",
                        fontWeight: 600,
                        marginBottom: 2,
                        marginTop: 3,
                    }}
                >
                    Detailed Breakdown
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow
                                sx={{
                                    backgroundColor: "#f5f5f5",
                                }}
                            >
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                >
                                    Storage Name
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    Usage (MB)
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    Quota (MB)
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    %
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="center"
                                >
                                    Trend
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {storages.map((storage) => (
                                <TableRow
                                    key={storage.name}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor: "#f9f9f9",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ fontSize: "0.875rem" }}>{storage.name}</TableCell>
                                    <TableCell sx={{ fontSize: "0.875rem" }} align="right">
                                        {formatNumber(storage.latestUsage)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.875rem" }} align="right">
                                        {formatNumber(storage.latestQuota)}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: getColorForPercentage(storage.percentage),
                                        }}
                                        align="right"
                                    >
                                        {storage.percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.75rem" }} align="center">
                                        {storage.trend === "up" && <span style={{ color: "#d32f2f" }}>↑ +{formatNumber(storage.trendPercent)}</span>}
                                        {storage.trend === "down" && <span style={{ color: "#388e3c" }}>↓ -{formatNumber(storage.trendPercent)}</span>}
                                        {storage.trend === "stable" && <span style={{ color: "#666" }}>→</span>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
