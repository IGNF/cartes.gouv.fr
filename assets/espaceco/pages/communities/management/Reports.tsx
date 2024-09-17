import Alert from "@codegouvfr/react-dsfr/Alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityResponseDTO, TableResponseDTO } from "../../../../@types/espaceco";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import ThemeList from "./reports/ThemeList";

type ReportsProps = {
    community: CommunityResponseDTO;
};

const Reports: FC<ReportsProps> = ({ community }) => {
    const schema = yup.object({
        attributes: yup.array().of(yup.object()),
    });

    const tablesQuery = useQuery<Partial<TableResponseDTO>[], CartesApiException>({
        queryKey: RQKeys.tables(community.id),
        queryFn: ({ signal }) => api.permission.getThemableTables(community.id, signal),
        staleTime: 60000,
    });

    // TODO Typer le formulaire
    const form = useForm({ resolver: yupResolver(schema), mode: "onChange", values: { attributes: community.attributes ?? [] } });

    return (
        <div>
            {tablesQuery.isError && <Alert severity="error" closable title={tablesQuery.error.message} />}
            {tablesQuery.isError ? (
                <Alert severity="error" closable title={tablesQuery.error.message} />
            ) : (
                <ThemeList form={form} tables={tablesQuery.data ?? []} />
            )}
        </div>
    );
};

export default Reports;
