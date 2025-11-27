import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

interface IListHeaderProps {
    dataUpdatedAt?: number;
    isFetching?: boolean;
    nbResults: {
        displayed: number;
        total: number;
    };
    refetch: () => void;
}

export function ListHeader(props: IListHeaderProps) {
    const { dataUpdatedAt, isFetching, nbResults, refetch } = props;
    const { t } = useTranslation("Common");

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-my-2v")}>
            <div
                className={fr.cx("fr-col")}
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <Button
                    title={t("refresh")}
                    onClick={() => refetch()}
                    iconId="ri-refresh-line"
                    nativeButtonProps={{
                        "aria-disabled": isFetching,
                    }}
                    disabled={isFetching}
                    size="small"
                    className={isFetching ? "frx-icon-spin" : ""}
                    priority="tertiary no outline"
                />
                {dataUpdatedAt && <span className={fr.cx("fr-text--xs", "fr-mb-0", "fr-mr-2v")}>{t("last_refresh_date", { dataUpdatedAt })}</span>}
                <p className={fr.cx("fr-text--xs", "fr-mb-0", "fr-ml-auto")}>{t("nb_results", { displayed: nbResults.displayed, total: nbResults.total })}</p>
            </div>
        </div>
    );
}
