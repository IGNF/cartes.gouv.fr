import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";
import Table from "@codegouvfr/react-dsfr/Table";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";

import api from "../../../../api";
import LoadingText from "../../../../components/Utils/LoadingText";
import Progress from "../../../../components/Utils/Progress";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import { Annexe, Datastore } from "../../../../types/app";
import { niceBytes } from "../../../../utils";
import Alert from "@codegouvfr/react-dsfr/Alert";

type AnnexeUsageProps = {
    datastore: Datastore;
};
const AnnexeUsage: FC<AnnexeUsageProps> = ({ datastore }) => {
    const { t } = useTranslation("DatastoreManageStorage");
    const { t: tCommon } = useTranslation("Common");

    const annexeUsage = useMemo(() => {
        return datastore?.storages.annexe;
    }, [datastore]);

    const annexeListQuery = useQuery<Annexe[], CartesApiException>({
        queryKey: RQKeys.datastore_annexe_list(datastore._id),
        queryFn: ({ signal }) => api.annexe.getList(datastore._id, { signal }),
        staleTime: 60000,
    });

    return (
        <>
            <p>{t("storage.annexe.explanation")}</p>

            {annexeUsage ? (
                <Progress
                    label={`${niceBytes(annexeUsage.use.toString())} / ${niceBytes(annexeUsage.quota.toString())}`}
                    value={annexeUsage.use}
                    max={annexeUsage.quota}
                />
            ) : (
                <p>{t("storage.not_found")}</p>
            )}

            {annexeListQuery.isFetching && <LoadingText message={t("storage.annexe.loading")} as="p" withSpinnerIcon className={fr.cx("fr-mt-4v")} />}

            {annexeListQuery.error && <Alert severity="error" title={annexeListQuery.error.message} as="h2" closable onClose={annexeListQuery.refetch} />}

            {annexeListQuery.data && annexeListQuery.data.length > 0 && (
                <Table
                    noCaption
                    noScroll
                    bordered
                    className={fr.cx("fr-mt-4v")}
                    data={annexeListQuery.data.map((annexe) => [
                        annexe.paths[0] ?? "",
                        annexe.mime_type,
                        annexe.size ? niceBytes(annexe.size?.toString()) : t("data.size.unknown"),
                        <Button
                            key={annexe._id}
                            priority="tertiary no outline"
                            iconId="fr-icon-delete-line"
                            onClick={() => console.warn("Fonctionnalité non implémentée")}
                        >
                            {tCommon("delete")}
                        </Button>,
                    ])}
                />
            )}
        </>
    );
};

export default AnnexeUsage;
