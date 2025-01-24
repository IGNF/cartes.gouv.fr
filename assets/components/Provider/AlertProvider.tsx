import { useQuery } from "@tanstack/react-query";
import { FC, PropsWithChildren, useEffect } from "react";
import { symToStr } from "tsafe/symToStr";

import { IApiAlert } from "../../@types/alert";
import { CartesApiException } from "../../modules/jsonFetch";
import RQKeys from "../../modules/entrepot/RQKeys";
import api from "../../entrepot/api";
import { useAlertStore } from "../../stores/AlertStore";

const AlertProvider: FC<PropsWithChildren> = (props) => {
    const { children } = props;
    const setAlerts = useAlertStore((state) => state.setAlerts);

    const { data } = useQuery<IApiAlert[], CartesApiException>({
        queryKey: RQKeys.alerts(),
        queryFn: ({ signal }) => api.alerts.get({ signal, cache: "no-store" }),
    });

    useEffect(() => {
        if (data) {
            setAlerts(data.map((rawAlert) => ({ ...rawAlert, date: new Date(rawAlert.date) })));
        }
    }, [data, setAlerts]);

    return children;
};
AlertProvider.displayName = symToStr({ AlertProvider });

export default AlertProvider;
