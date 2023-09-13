import { fr } from "@codegouvfr/react-dsfr";
import { FC, useState, useEffect } from "react";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
type StatusType = "public" | "privé";

export type QuotaType = {
    checked?: boolean;
    quota: number;
    status: StatusType;
};

type EndpointQuotaProps = {
    label: string;
    hintText?: string;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (values: Record<string, QuotaType>) => void;
};

const EndpointQuota: FC<EndpointQuotaProps> = (props) => {
    const { label, hintText, state, stateRelatedMessage, onChange } = props;

    const [quotas, setQuotas] = useState<Record<string, QuotaType>>(() => {
        const quotas: Record<string, QuotaType> = {};
        ["WFS", "WMS (Vecteur)", "WMS (Raster)", "WMTS", "TMS"].forEach((endpoint) => {
            quotas[endpoint] = { checked: false, quota: 5, status: "public" };
        });
        return quotas;
    });
    const [selectedQuotas, setSelectedQuotas] = useState<Record<string, QuotaType>>({});

    useEffect(() => {
        const res: Record<string, QuotaType> = {};
        Object.keys(quotas).forEach((endpoint) => {
            if (quotas[endpoint].checked) {
                const q = (({ quota, status }) => ({ quota, status }))(quotas[endpoint]);
                res[endpoint] = q;
            }
        });
        setSelectedQuotas(res);
    }, [quotas]);

    useEffect(() => {
        onChange(selectedQuotas);
    }, [selectedQuotas, onChange]);

    const toggleEndpoint = (endpoint: string) => {
        const q = { ...quotas };
        q[endpoint].checked = !q[endpoint].checked;
        setQuotas(q);
    };
    const handleChangeQuota = (endpoint: string, quota: string) => {
        const q = { ...quotas };
        q[endpoint].quota = parseInt(quota, 10);
        setQuotas(q);
    };
    const handleChangeStatus = (endpoint: string, status: StatusType) => {
        const q = { ...quotas };
        q[endpoint].status = status;
        setQuotas(q);
    };

    return (
        <div className={fr.cx("fr-my-2w")}>
            <label className={fr.cx("fr-label", state === "error" && "fr-label--error")}>
                {label}
                <span className={fr.cx("fr-hint-text")}>{hintText}</span>
            </label>
            <div>
                {Object.keys(quotas).map((endpoint) => {
                    return (
                        <div key={endpoint} className={fr.cx("fr-grid-row", "fr-grid-row--top", "fr-mx-4w", "fr-mb-2w")}>
                            <div className={fr.cx("fr-col-12", "fr-col-md-4", "fr-col--middle")}>
                                <Checkbox
                                    options={[
                                        {
                                            label: endpoint,
                                            nativeInputProps: {
                                                value: endpoint,
                                                onChange: () => toggleEndpoint(endpoint),
                                            },
                                        },
                                    ]}
                                />
                            </div>
                            <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                                <RadioButtons
                                    legend="Statut"
                                    options={[
                                        {
                                            label: "Public",
                                            nativeInputProps: {
                                                checked: quotas[endpoint].status === "public",
                                                value: "public",
                                                onChange: () => handleChangeStatus(endpoint, "public"),
                                            },
                                        },
                                        {
                                            label: "Privé",
                                            nativeInputProps: {
                                                checked: quotas[endpoint].status === "privé",
                                                value: "privé",
                                                onChange: () => handleChangeStatus(endpoint, "privé"),
                                            },
                                        },
                                    ]}
                                    small
                                    orientation="horizontal"
                                />
                            </div>
                            <div className={fr.cx("fr-col-12", "fr-col-md-4")}>
                                <Select
                                    label="Quota"
                                    nativeSelectProps={{
                                        value: quotas[endpoint].quota,
                                        onChange: (e) => handleChangeQuota(endpoint, e.currentTarget.value),
                                    }}
                                >
                                    {[5, 10, 15, 20, 25, 30].map((v) => {
                                        return (
                                            <option key={v} value={v}>
                                                {v}
                                            </option>
                                        );
                                    })}
                                </Select>
                            </div>
                        </div>
                    );
                })}
            </div>
            {state === "error" && <p className={fr.cx("fr-error-text")}>{stateRelatedMessage}</p>}
        </div>
    );
};

export default EndpointQuota;
