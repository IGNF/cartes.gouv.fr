import { fr } from "@codegouvfr/react-dsfr";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { compareAsc } from "date-fns";
import { FC, useState } from "react";

import { PermissionWithOfferingsDetailsResponseDto } from "../../../../@types/entrepot";
import { useTranslation } from "../../../../i18n/i18n";
import { formatDateWithoutTimeFromISO } from "../../../../utils";
import { routes } from "../../../../router/router";
import { externalLink } from "@/router/externalUrls";

import "../../../../sass/pages/my_keys.scss";
import ovoidSvgUrl from "@codegouvfr/react-dsfr/dsfr/artwork/background/ovoid.svg?no-inline";
import padlock from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/system/padlock.svg?no-inline";
import Select from "@codegouvfr/react-dsfr/Select";
import Button from "@codegouvfr/react-dsfr/Button";

type PermissionsListTabProps = {
    permissions: PermissionWithOfferingsDetailsResponseDto[] | undefined;
};

const PermissionsListTab: FC<PermissionsListTabProps> = ({ permissions }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("Permissions");

    const [filter, setFilter] = useState<"active" | "expired">("active");

    const [showFilters, setShowFilters] = useState(false);
    const [sortValue, setSortValue] = useState("");
    const [fluxValue, setFluxValue] = useState("");
    const toggleFilters = () => {
        if (showFilters) {
            setSortValue("");
            setFluxValue("");
        }
        setShowFilters((prev) => !prev);
    };

    if (!permissions) return null;

    const availableTypes = Array.from(new Set((permissions ?? []).flatMap((permission) => (permission.offerings ?? []).map((offering) => offering.type)))).sort(
        (a, b) => a.localeCompare(b, "fr", { sensitivity: "base" })
    );

    const filteredAndSortedPermissions = [...(permissions ?? [])]
        .map((permission) => {
            const expired = permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0;
            return { ...permission, expired };
        })
        .filter((p) => (filter === "expired" ? p.expired : !p.expired))
        .filter((permission) => {
            if (!fluxValue) return true;
            const offerings = permission.offerings ?? [];
            return offerings.some((offering) => offering.type === fluxValue);
        })
        .sort((a, b) => {
            switch (sortValue) {
                case "alphabetical_order":
                    return a.licence.localeCompare(b.licence, "fr", { sensitivity: "base" });
                case "reverse_alphabetical_order":
                    return b.licence.localeCompare(a.licence, "fr", { sensitivity: "base" });
                case "latest_date": {
                    const dateA = a.end_date ? new Date(a.end_date).getTime() : 0;
                    const dateB = b.end_date ? new Date(b.end_date).getTime() : 0;
                    return dateB - dateA;
                }
                case "oldest_date": {
                    const dateA = a.end_date ? new Date(a.end_date).getTime() : Number.MAX_SAFE_INTEGER;
                    const dateB = b.end_date ? new Date(b.end_date).getTime() : Number.MAX_SAFE_INTEGER;
                    return dateA - dateB;
                }
                default:
                    return 0;
            }
        });

    const expiredCount = filteredAndSortedPermissions
        ? filteredAndSortedPermissions.filter((p) => p.end_date && compareAsc(new Date(p.end_date), new Date()) < 0).length
        : 0;

    const activeCount = filteredAndSortedPermissions ? filteredAndSortedPermissions.length - expiredCount : 0;

    return permissions === undefined || permissions.length === 0 ? (
        <div className={fr.cx("fr-my-8w", "fr-mb-4w", "fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
            <div className={fr.cx("fr-col-12", "fr-col-sm-5", "fr-col-md-4", "fr-py-0")}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={fr.cx("fr-responsive-img", "fr-artwork")}
                    aria-hidden="true"
                    width="160"
                    height="200"
                    viewBox="0 0 160 200"
                >
                    <use className={fr.cx("fr-artwork-motif")} href={`${ovoidSvgUrl}#artwork-motif`} />
                    <use className={fr.cx("fr-artwork-background")} href={`${ovoidSvgUrl}#artwork-background`} />
                    <g transform="translate(40, 60)">
                        <use className={fr.cx("fr-artwork-decorative")} href={`${padlock}#artwork-decorative`} />
                        <use className={fr.cx("fr-artwork-minor")} href={`${padlock}#artwork-minor`} />
                        <use className={fr.cx("fr-artwork-major")} href={`${padlock}#artwork-major`} />
                    </g>
                </svg>
            </div>
            <div className={fr.cx("fr-col-sm-7", "fr-col-md-8", "fr-pl-md-6w")}>
                <h6>{t("no_permissions")}</h6>
                {t("explain_no_permissions")}
                <div>
                    <a {...externalLink("helpUserGuideCreateKeys", t("consult_documentation"))} className={fr.cx("fr-link")}>
                        {t("consult_documentation")}
                    </a>
                </div>
                <div className={fr.cx("fr-mt-2v")}>
                    <a
                        {...routes.datastore_selection().link}
                        className={fr.cx("fr-link", "fr-icon-arrow-right-line", "fr-link--icon-right")}
                        title={t("discover_workspaces") + " - " + tCommon("new_window")}
                    >
                        {t("discover_workspaces")}
                    </a>
                </div>
            </div>
        </div>
    ) : (
        <div>
            <p>{t("explain_permissions")}</p>
            <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mt-10v", "fr-mb-5v")}>
                <Select
                    label={null}
                    className={fr.cx("fr-col-12", "fr-col-lg-6")}
                    nativeSelectProps={{
                        onChange: (event) => setFilter(event.target.value as "active" | "expired"),
                        value: filter,
                    }}
                >
                    <option value="active">{t("active_permissions")}</option>
                    <option value="expired">{t("permissions_expired")}</option>
                </Select>
                <Button
                    className={fr.cx("fr-mt-3v", "fr-ml-1w")}
                    priority="tertiary"
                    title={showFilters ? tCommon("remove_filters") : tCommon("filter")}
                    iconId={showFilters ? "fr-icon-filter-fill" : "fr-icon-filter-line"}
                    onClick={toggleFilters}
                />
            </div>
            {showFilters && (
                <div className={fr.cx("fr-grid-row", "fr-grid-row--gutters", "fr-mb-5v")}>
                    <Select
                        className={fr.cx("fr-col-6", "fr-col-sm-5")}
                        label={t("sorting")}
                        nativeSelectProps={{
                            value: sortValue,
                            onChange: (e) => setSortValue(e.target.value),
                        }}
                    >
                        <option value="" disabled hidden>
                            {tCommon("select_option")}
                        </option>
                        <option value="alphabetical_order">{t("alphabetical_order")}</option>
                        <option value="reverse_alphabetical_order">{t("reverse_alphabetical_order")}</option>
                        <option value="latest_date">{t("latest_date")}</option>
                        <option value="oldest_date">{t("oldest_date")}</option>
                    </Select>
                    <Select
                        className={fr.cx("fr-col-6", "fr-col-sm-5")}
                        label={t("type_sorting")}
                        nativeSelectProps={{
                            value: fluxValue,
                            onChange: (e) => setFluxValue(e.target.value),
                        }}
                    >
                        <option value="" disabled hidden>
                            {tCommon("select_option")}
                        </option>
                        {availableTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </Select>
                </div>
            )}

            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters", "fr-mb-2v", "fr-ml-1w")}>
                {filter === "active" ? (
                    <>
                        <span className={fr.cx("fr-icon-check-line")} />
                        <h3 className={fr.cx("fr-mt-6v", "fr-mx-1w")}>{t("active_permissions")}</h3>
                        <Badge noIcon severity="info">
                            {activeCount}
                        </Badge>
                    </>
                ) : (
                    <>
                        <span className={fr.cx("fr-icon-close-line")} />
                        <h3 className={fr.cx("fr-mt-6v", "fr-mx-1w")}>{t("permissions_expired")}</h3>
                        <Badge noIcon severity="info">
                            {expiredCount}
                        </Badge>
                    </>
                )}
            </div>

            {filteredAndSortedPermissions
                .map((permission) => {
                    const expired = permission.end_date && compareAsc(new Date(permission.end_date), new Date()) < 0;

                    return { ...permission, expired };
                })
                .filter((p) => (filter === "expired" ? p.expired : !p.expired))
                .map((permission) => {
                    const expiresOn = permission.end_date ? formatDateWithoutTimeFromISO(permission.end_date) : null;

                    return (
                        <div
                            key={permission._id}
                            className={fr.cx("fr-mb-5v", "fr-px-6v", "fr-py-3w")}
                            style={{
                                border: "1px solid",
                                borderColor: fr.colors.decisions.border.default.grey.default,
                            }}
                        >
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--middle", "fr-grid-row--gutters")}>
                                <h4 className={`frx-col-md-auto ${fr.cx("fr-col-12")}`}>{permission.licence}</h4>
                                <div className={`frx-flex-end-md frx-col-md-auto ${fr.cx("fr-col-12", "fr-mb-6v")}`}>
                                    {permission.expired ? (
                                        <Badge severity="warning">{t("expired", { date: expiresOn })}</Badge>
                                    ) : (
                                        expiresOn && <div>{t("expires_on", { date: expiresOn })}</div>
                                    )}
                                </div>
                            </div>
                            <ul>
                                {permission.offerings
                                    .sort((a, b) =>
                                        a.layer_name.localeCompare(b.layer_name, "fr", {
                                            sensitivity: "base",
                                        })
                                    )
                                    .map((offering) => (
                                        <li key={offering._id} className={fr.cx("fr-mb-1v")}>
                                            <span>
                                                {offering.layer_name}
                                                <Badge className={fr.cx("fr-ml-1w")} noIcon severity="info">
                                                    {offering.type}
                                                </Badge>
                                            </span>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    );
                })}
        </div>
    );
};

export default PermissionsListTab;
