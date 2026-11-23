import { fr } from "@codegouvfr/react-dsfr";
import Table from "@codegouvfr/react-dsfr/Table";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { Fragment, type ReactNode } from "react";
import { tss } from "tss-react";

import { type StoredDataRelation } from "@/@types/app";
import { type JsonNode } from "@/@types/entrepot";
import ExtentMap from "@/components/Utils/ExtentMap";
import { useTranslation } from "@/i18n";
import { formatDateFromISO } from "@/utils";
import MetadataSection from "../forms/MetadataSection";
import MetadataSectionsContainer from "../forms/MetadataSectionsContainer";
import { descriptionRows, type DetailsData, productionDate } from "./dataDetailsRows";

type DataDetailsSheetProps = {
    details: DetailsData;
    statusBadge: ReactNode;
    extent: JsonNode | undefined;
    /** absent : pas de section Structure */
    relations: StoredDataRelation[] | undefined;
    steps: ReactNode;
};

const byName = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);

export default function DataDetailsSheet({ details, statusBadge, extent, relations, steps }: DataDetailsSheetProps) {
    const { t } = useTranslation("DataDetails");
    const { classes, cx } = useStyles();
    const { data } = details;
    const tags = data.tags ?? {};
    const lastEventDate = data.last_event?.date;

    const valueOrNotProvided = (value: ReactNode) => value || t("not_provided");

    const fields = (rows: [string, ReactNode][]) => (
        <dl className={fr.cx("fr-m-0", "fr-p-0")}>
            {rows.map(([label, value]) => (
                <Fragment key={label}>
                    <dt className={fr.cx("fr-text--sm", "fr-mb-0")}>{label}</dt>
                    <dd className={classes.value}>{valueOrNotProvided(value)}</dd>
                </Fragment>
            ))}
        </dl>
    );

    return (
        <MetadataSectionsContainer>
            <div className={cx(fr.cx("fr-col-12"), classes.header)}>
                <h1 className={fr.cx("fr-h6", "fr-mb-0")}>{data.name}</h1>
                <div className={classes.tags}>
                    <Tag small>{t(details.kind === "upload" ? "tag.upload" : "tag.data")}</Tag>
                    <Tag small>{t(`type.${details.kind}`)}</Tag>
                    {statusBadge}
                </div>
            </div>

            <MetadataSection title={t("section.description")}>
                {fields(
                    descriptionRows(details).flatMap(([field, value]): [string, ReactNode][] =>
                        // le type suit le poids, comme sur la maquette
                        field === "size"
                            ? [
                                  [t("field.size"), value],
                                  [t("field.type"), t(`type.${details.kind}`)],
                              ]
                            : [[t(`field.${field}`), value]]
                    )
                )}
            </MetadataSection>

            <MetadataSection title={t("section.producer")}>{fields([[t("field.producer"), tags.producer]])}</MetadataSection>

            <MetadataSection title={t("section.date")}>{fields([[t("field.date"), productionDate(tags)]])}</MetadataSection>

            <MetadataSection title={t("section.extent")}>
                {fields([[t("field.zone"), tags.zone]])}
                {extent && (
                    <>
                        <p className={fr.cx("fr-text--sm", "fr-mb-1v")}>{t("field.extent")}</p>
                        <ExtentMap extents={extent} />
                    </>
                )}
            </MetadataSection>

            {relations && relations.length > 0 && (
                <MetadataSection title={t("section.structure")}>
                    {[...relations]
                        .sort((a, b) => byName(a.name, b.name))
                        .map((relation) => (
                            <Table
                                key={relation.name}
                                caption={relation.name}
                                noScroll
                                bordered
                                headers={[t("structure.attribute"), t("structure.type")]}
                                data={Object.entries(relation.attributes)
                                    .sort(([a], [b]) => byName(a, b))
                                    .map(([name, type]) => [`${name}${name === relation.primary_key?.[0] ? t("structure.primary_key") : ""}`, type])}
                            />
                        ))}
                </MetadataSection>
            )}

            <MetadataSection title={t("section.report")}>
                {fields([
                    [t("report.creation"), data.creation && formatDateFromISO(data.creation)],
                    [t("report.update"), lastEventDate && formatDateFromISO(lastEventDate)],
                    [t("report.status"), statusBadge],
                ])}
                <h3 className={fr.cx("fr-text--md", "fr-text--bold", "fr-mb-2w")}>{t("report.steps")}</h3>
                {steps}
            </MetadataSection>
        </MetadataSectionsContainer>
    );
}

const useStyles = tss.withName({ DataDetailsSheet }).create({
    header: {
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("2w"),
        padding: `${fr.spacing("3w")} ${fr.spacing("6v")} !important`,
        borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        [fr.breakpoints.up("md")]: {
            padding: `${fr.spacing("3w")} ${fr.spacing("10v")} !important`,
        },
    },
    tags: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: fr.spacing("3v"),
    },
    value: {
        marginLeft: 0,
        paddingLeft: 0,
        marginBottom: fr.spacing("2w"),
        overflowWrap: "anywhere",
    },
});
