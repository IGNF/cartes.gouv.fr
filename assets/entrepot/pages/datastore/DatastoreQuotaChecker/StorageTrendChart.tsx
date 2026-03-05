import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { StorageChartDataPoint } from "./types";

interface StorageTrendChartProps {
    data: StorageChartDataPoint[];
}

export default function StorageTrendChart({ data }: StorageTrendChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card sx={{ height: 400, boxShadow: "0 2px 4px rgba(0,0,0,0.08)" }}>
                <CardContent
                    sx={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography color="textSecondary">No data available</Typography>
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
                    Storage Usage Trend
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis
                            label={{
                                value: "Usage (MB)",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                padding: "8px",
                            }}
                            formatter={(value) => {
                                if (typeof value === "number") {
                                    return [value.toFixed(2), "MB"];
                                }
                                return value;
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        <Line type="monotone" dataKey="postgresql" stroke="#1976d2" strokeWidth={2} dot={false} name="PostgreSQL" isAnimationActive={false} />
                        <Line type="monotone" dataKey="s3Data" stroke="#d32f2f" strokeWidth={2} dot={false} name="S3 Data" isAnimationActive={false} />
                        <Line type="monotone" dataKey="s3Uploads" stroke="#f57c00" strokeWidth={2} dot={false} name="S3 Uploads" isAnimationActive={false} />
                        <Line type="monotone" dataKey="s3Annexes" stroke="#388e3c" strokeWidth={2} dot={false} name="S3 Annexes" isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
