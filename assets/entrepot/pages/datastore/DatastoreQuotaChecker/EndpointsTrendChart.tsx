import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { EndpointChartDataPoint } from "./types";

interface EndpointsTrendChartProps {
    data: EndpointChartDataPoint[];
}

// Color palette for different endpoints
const COLORS = [
    "#1976d2", // blue
    "#d32f2f", // red
    "#f57c00", // orange
    "#388e3c", // green
    "#7b1fa2", // purple
    "#00796b", // teal
    "#e64a19", // dark orange
    "#0097a7", // cyan
];

export default function EndpointsTrendChart({ data }: EndpointsTrendChartProps) {
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

    // Extract all endpoint keys (skip 'timestamp')
    const endpoints = Object.keys(data[0]).filter((key) => key !== "timestamp");

    if (endpoints.length === 0) {
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
                    <Typography color="textSecondary">No endpoints data</Typography>
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
                        marginBottom: 2,
                        color: "#000091",
                    }}
                >
                    Endpoints Usage Trend
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis
                            label={{
                                value: "Usage Count",
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
                                    return [Math.round(value), "Usage"];
                                }
                                return value;
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: "20px" }} />
                        {endpoints.map((endpoint, index) => (
                            <Line
                                key={endpoint}
                                type="monotone"
                                dataKey={endpoint}
                                stroke={COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={false}
                                name={endpoint.replace(/-/g, " ")}
                                isAnimationActive={false}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
