import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { CommunityResponseDTO, TableResponseDTO } from "../../../../@types/espaceco";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import { AddThemeDialog, AddThemeDialogModal } from "./reports/AddThemeDialog";
import ThemeList from "./reports/ThemeList";

type ReportsProps = {
    community: CommunityResponseDTO;
};

const Reports: FC<ReportsProps> = ({ community }) => {
    const { t } = useTranslation("Theme");

    const schema = yup.object({
        attributes: yup.array().of(yup.object()),
    });

    const tablesQuery = useQuery<Partial<TableResponseDTO>[], CartesApiException>({
        queryKey: RQKeys.tables(community.id),
        queryFn: ({ signal }) => api.permission.getThemableTables(community.id, signal),
        staleTime: 60000,
    });

    const form = useForm({ resolver: yupResolver(schema), mode: "onChange", values: { attributes: community.attributes ?? [] } });
    const { getValues: getFormValues, setValue: setFormValue } = form;

    return (
        <div>
            {tablesQuery.isError && <Alert severity="error" closable title={tablesQuery.error.message} />}
            {tablesQuery.isError ? (
                <Alert severity="error" closable title={tablesQuery.error.message} />
            ) : (
                <>
                    <ThemeList form={form} tables={tablesQuery.data ?? []} />
                    {/* <Button onClick={() => AddThemeDialogModal.open()}>{t("add_theme")} </Button>
                    <AddThemeDialog
                        themes={community.attributes}
                        tables={tablesQuery.data ?? []}
                        onAdd={(theme) => {
                            const attributes = getFormValues("attributes");
                            if (attributes) {
                                attributes.push(theme);
                            }
                            setFormValue("attributes", attributes);
                        }}
                    /> */}
                </>
            )}
        </div>
    );
};

export default Reports;
