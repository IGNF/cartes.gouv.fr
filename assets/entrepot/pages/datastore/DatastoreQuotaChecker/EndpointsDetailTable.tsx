import { useState, useMemo } from "react";
import { Box, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography, TextField } from "@mui/material";

import { EndpointSummary } from "./types";
import { getColorForPercentage, formatNumber } from "./quotaChartUtils";

interface EndpointsDetailTableProps {
    endpoints: EndpointSummary[];
}

type SortField = "name" | "type" | "percentage" | "usage";

export default function EndpointsDetailTable({ endpoints }: EndpointsDetailTableProps) {
    const [sortField, setSortField] = useState<SortField>("percentage");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [filterText, setFilterText] = useState("");

    const filteredAndSorted = useMemo(() => {
        const filtered = endpoints
            .filter(
                (ep) =>
                    ep.name.toLowerCase().includes(filterText.toLowerCase()) ||
                    ep.technical_name.toLowerCase().includes(filterText.toLowerCase()) ||
                    ep.type.toLowerCase().includes(filterText.toLowerCase())
            )
            .sort((a, b) => {
                let aValue: number | string = "";
                let bValue: number | string = "";

                switch (sortField) {
                    case "name":
                        aValue = a.name;
                        bValue = b.name;
                        break;
                    case "type":
                        aValue = a.type;
                        bValue = b.type;
                        break;
                    case "percentage":
                        aValue = a.percentage;
                        bValue = b.percentage;
                        break;
                    case "usage":
                        aValue = a.latestUsage;
                        bValue = b.latestUsage;
                        break;
                }

                const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                return sortOrder === "asc" ? comparison : -comparison;
            });

        return filtered;
    }, [endpoints, sortField, sortOrder, filterText]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("desc");
        }
    };

    if (!endpoints || endpoints.length === 0) {
        return (
            <Card sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <CardContent>
                    <Typography color="textSecondary">No endpoints data available</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
            <CardContent>
                <Typography
                    sx={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        marginBottom: 2,
                        color: "#000091",
                    }}
                >
                    Endpoints Details
                </Typography>

                <Box sx={{ marginBottom: 2 }}>
                    <TextField
                        placeholder="Filter by name, technical name, or type..."
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </Box>

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
                                    <TableSortLabel
                                        active={sortField === "name"}
                                        direction={sortField === "name" ? sortOrder : "asc"}
                                        onClick={() => handleSort("name")}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                >
                                    <TableSortLabel
                                        active={sortField === "type"}
                                        direction={sortField === "type" ? sortOrder : "asc"}
                                        onClick={() => handleSort("type")}
                                    >
                                        Type
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    <TableSortLabel
                                        active={sortField === "usage"}
                                        direction={sortField === "usage" ? sortOrder : "asc"}
                                        onClick={() => handleSort("usage")}
                                    >
                                        Usage
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    Quota
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        color: "#000091",
                                    }}
                                    align="right"
                                >
                                    <TableSortLabel
                                        active={sortField === "percentage"}
                                        direction={sortField === "percentage" ? sortOrder : "desc"}
                                        onClick={() => handleSort("percentage")}
                                    >
                                        %
                                    </TableSortLabel>
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
                            {filteredAndSorted.map((endpoint) => (
                                <TableRow
                                    key={endpoint.technical_name}
                                    sx={{
                                        "&:hover": {
                                            backgroundColor: "#f9f9f9",
                                        },
                                    }}
                                >
                                    <TableCell sx={{ fontSize: "0.875rem" }}>
                                        <div
                                            title={endpoint.technical_name}
                                            style={{
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                maxWidth: "200px",
                                            }}
                                        >
                                            {endpoint.name}
                                        </div>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.875rem" }}>
                                        <span
                                            style={{
                                                backgroundColor: "#f0f0f0",
                                                padding: "2px 6px",
                                                borderRadius: "3px",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {endpoint.type}
                                        </span>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.875rem" }} align="right">
                                        {formatNumber(endpoint.latestUsage)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.875rem" }} align="right">
                                        {formatNumber(endpoint.latestQuota)}
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            fontSize: "0.875rem",
                                            fontWeight: 600,
                                            color: getColorForPercentage(endpoint.percentage),
                                        }}
                                        align="right"
                                    >
                                        {endpoint.percentage.toFixed(1)}%
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.75rem" }} align="center">
                                        {endpoint.trend === "up" && (
                                            <span style={{ color: "#d32f2f" }} title={`+${formatNumber(endpoint.trendPercent)} from previous`}>
                                                ↑
                                            </span>
                                        )}
                                        {endpoint.trend === "down" && (
                                            <span style={{ color: "#388e3c" }} title={`-${formatNumber(endpoint.trendPercent)} from previous`}>
                                                ↓
                                            </span>
                                        )}
                                        {endpoint.trend === "stable" && (
                                            <span style={{ color: "#666" }} title="No change">
                                                →
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "textSecondary",
                        marginTop: 2,
                    }}
                >
                    Showing {filteredAndSorted.length} of {endpoints.length} endpoints
                </Typography>
            </CardContent>
        </Card>
    );
}
