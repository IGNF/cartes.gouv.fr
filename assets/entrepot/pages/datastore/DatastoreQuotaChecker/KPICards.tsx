import { fr } from "@codegouvfr/react-dsfr";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { PropsWithChildren } from "react";

import { EndpointSummary, StorageSummary } from "./types";
import { formatNumber, getColorForPercentage } from "./quotaChartUtils";

interface KPICardProps {
    title: string;
    value: string | number;
    unit?: string;
    percentage?: number;
    trend?: "up" | "down" | "stable";
    trendValue?: number;
}

function KPICard({ title, value, unit, percentage, trend, trendValue }: PropsWithChildren<KPICardProps>) {
    const percentageColor = percentage !== undefined ? getColorForPercentage(percentage) : undefined;

    return (
        <Card
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.3s ease",
                "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
                },
            }}
        >
            <CardContent sx={{ flex: 1 }}>
                <Typography color="textSecondary" gutterBottom sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                    {title}
                </Typography>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 0.5,
                        marginY: 1,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "1.75rem",
                            fontWeight: 700,
                            color: "#000091",
                        }}
                    >
                        {value}
                    </Typography>
                    {unit && (
                        <Typography
                            sx={{
                                fontSize: "0.875rem",
                                color: "textSecondary",
                                fontWeight: 500,
                            }}
                        >
                            {unit}
                        </Typography>
                    )}
                </Box>

                {percentage !== undefined && (
                    <Box sx={{ marginY: 1 }}>
                        <Typography
                            sx={{
                                fontSize: "0.875rem",
                                color: percentageColor,
                                fontWeight: 600,
                            }}
                        >
                            {percentage.toFixed(1)}%
                        </Typography>
                    </Box>
                )}

                {trend !== undefined && trendValue !== undefined && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            marginTop: 1,
                        }}
                    >
                        {trend === "up" && (
                            <i
                                className="ri-trending-up-line"
                                style={{
                                    fontSize: "1rem",
                                    color: "#d32f2f",
                                }}
                            />
                        )}
                        {trend === "down" && (
                            <i
                                className="ri-trending-down-line"
                                style={{
                                    fontSize: "1rem",
                                    color: "#388e3c",
                                }}
                            />
                        )}
                        {trend !== "stable" && (
                            <Typography sx={{ fontSize: "0.75rem" }}>
                                {trend === "up" ? "+" : "-"}
                                {formatNumber(trendValue)}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

interface KPICardsProps {
    topEndpoints?: EndpointSummary[];
    storages?: StorageSummary[];
    totalEndpoints?: number;
    latestSnapshot?: string;
}

export default function KPICards({ topEndpoints = [], storages = [], totalEndpoints = 0, latestSnapshot }: KPICardsProps) {
    // Calculate highest storage percentage
    const storagePercentage = storages.length > 0 ? Math.max(...storages.map((s) => s.percentage)) : 0;

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-4w")}>
            {/* Total Endpoints Card */}
            <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-3")}>
                <KPICard title="Total Endpoints" value={totalEndpoints} unit="services" />
            </div>

            {/* Highest Usage Endpoint Card */}
            {topEndpoints.length > 0 && (
                <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-3")}>
                    <KPICard
                        title="Highest Usage Endpoint"
                        value={topEndpoints[0].latestUsage}
                        unit={`/ ${topEndpoints[0].latestQuota}`}
                        percentage={topEndpoints[0].percentage}
                        trend={topEndpoints[0].trend}
                        trendValue={topEndpoints[0].trendPercent}
                    />
                </div>
            )}

            {/* Overall Storage Utilization Card */}
            <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-3")}>
                <KPICard title="Storage Utilization" value={storagePercentage.toFixed(1)} unit="%" percentage={storagePercentage} />
            </div>

            {/* Latest Snapshot Card */}
            {latestSnapshot && (
                <div className={fr.cx("fr-col-12", "fr-col-md-6", "fr-col-lg-3")}>
                    <KPICard title="Latest Data" value={latestSnapshot} />
                </div>
            )}
        </div>
    );
}
