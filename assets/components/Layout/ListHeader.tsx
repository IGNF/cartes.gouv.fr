import { useTranslation } from "@/i18n";
import { fr } from "@codegouvfr/react-dsfr";
import Button from "@codegouvfr/react-dsfr/Button";

interface IListHeaderProps {
    dataUpdatedAt?: number;
    isFetching?: boolean;
    nbResults: number;
    refetch?: () => void;
}

export function ListHeader(props: IListHeaderProps) {
    const { dataUpdatedAt, isFetching, nbResults, refetch } = props;
    const { t } = useTranslation("Common");

    return (
        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-mt-2v")}>
            <div
                className={fr.cx("fr-col")}
                style={{
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <h2 className={fr.cx("fr-text--sm", "fr-mb-0")}>{t("nb_results", { nb: nbResults })}</h2>
                {dataUpdatedAt && (
                    <span
                        className={fr.cx("fr-text--sm", "fr-mb-0", "fr-mr-2v")}
                        style={{
                            marginLeft: "auto",
                        }}
                    >
                        {t("last_refresh_date", { dataUpdatedAt })}
                    </span>
                )}
                {refetch && (
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
                    />
                )}
            </div>
        </div>
    );
}
