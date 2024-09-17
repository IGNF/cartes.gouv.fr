import Alert from "@codegouvfr/react-dsfr/Alert";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityResponseDTO, ReportFormType, TableResponseDTO } from "../../../../@types/espaceco";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import ReportStatuses from "./reports/ReportStatuses";
import ThemeList from "./reports/ThemeList";
import getDefaultStatuses from "./reports/Utils";
import Wait from "../../../../components/Utils/Wait";
import { fr } from "@codegouvfr/react-dsfr";
import LoadingText from "../../../../components/Utils/LoadingText";
import { useTranslation } from "../../../../i18n/i18n";

type ReportsProps = {
    community: CommunityResponseDTO;
};

const Reports: FC<ReportsProps> = ({ community }) => {
    const { t: tCommon } = useTranslation("Common");

    /*const schema = yup.object({
        attributes: yup.array().of(yup.object()).required(),
        report_statuses: yup.array().of(
            yup.object({
                status: yup.string().required(),
                wording: yup.string().required(),
                help: yup.string(),
            })
        )
    });*/

    const tablesQuery = useQuery<Partial<TableResponseDTO>[], CartesApiException>({
        queryKey: RQKeys.tables(community.id),
        queryFn: ({ signal }) => api.permission.getThemableTables(community.id, signal),
        staleTime: 60000,
    });

    const form = useForm<ReportFormType>({
        // resolver: yupResolver(schema),
        mode: "onChange",
        values: {
            attributes: community.attributes ?? [],
            report_statuses: getDefaultStatuses(),
        },
    });

    return (
        <div>
            {tablesQuery.isError ? (
                <Alert severity="error" closable title={tablesQuery.error.message} />
            ) : tablesQuery.isLoading ? (
                <Wait>
                    <div className={fr.cx("fr-grid-row")}>
                        <LoadingText as="h6" message={tCommon("loading")} />
                    </div>
                </Wait>
            ) : (
                <div>
                    <ThemeList form={form} tables={tablesQuery.data ?? []} />
                    <ReportStatuses form={form} statuses={community.report_statuses} />
                </div>
            )}
        </div>
    );
};

export default Reports;
