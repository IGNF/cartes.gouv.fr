import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Pagination from "@codegouvfr/react-dsfr/Pagination";
import { SegmentedControl } from "@codegouvfr/react-dsfr/SegmentedControl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { tss } from "tss-react";

import { type DatasheetDocument, DatasheetDocumentTypeEnum } from "@/@types/app";
import { CommunityMemberDtoRightsEnum } from "@/@types/entrepot";
import CardRowsTable from "@/components/Utils/CardRowsTable";
import LoadingText from "@/components/Utils/LoadingText";
import MenuList from "@/components/Utils/MenuList";
import { TextCopyToClipboardDialog, TextCopyToClipboardModal } from "@/components/Utils/TextCopyToClipboardDialog";
import Wait from "@/components/Utils/Wait";
import api from "@/entrepot/api";
import { datasheetDocumentsQueryOptions } from "@/hooks/queries/datasheetDocumentsQueryOptions";
import useCommunityRights from "@/hooks/useCommunityRights";
import { usePagination } from "@/hooks/usePagination";
import { useTranslation } from "@/i18n";
import { externalLinkToUrl } from "@/router/externalUrls";
import { getApiErrorMessage } from "@/modules/apiError";
import RQKeys from "@/modules/entrepot/RQKeys";
import { type ApiError } from "@/modules/jsonFetch";
import { formatDateFromISO, getFileExtension } from "@/utils";
import DatasheetViewTab from "../../DatasheetViewTab";
import DocumentFormModal, { type DocumentFormTarget } from "./DocumentFormModal";

const LIMIT = 12;

// Nom, Format, Date d’ajout, menu
const COLUMN_WIDTHS = [undefined, "7rem", "14rem", "4rem"];

const formModal = createModal({ id: "documents-tab-next-form-modal", isOpenedByDefault: false });
const deleteModal = createModal({ id: "documents-tab-next-delete-modal", isOpenedByDefault: false });

type TypeFilter = "all" | DatasheetDocumentTypeEnum;

const FILTERS = [
    { value: "all", label: "filter.all" },
    { value: DatasheetDocumentTypeEnum.File, label: "filter.files" },
    { value: DatasheetDocumentTypeEnum.Link, label: "filter.links" },
] as const satisfies { value: TypeFilter; label: string }[];

// nom d’origine du fichier ; pour les anciens documents, dernier segment de son URL publique (non encodée par le serveur)
const fileNameOf = (document: DatasheetDocument) => document.file_name ?? document.url.split("/").pop() ?? document.name;

const formatOf = (document: DatasheetDocument) => {
    const extension = getFileExtension(fileNameOf(document))?.toUpperCase();
    return extension === "JPG" ? "JPEG" : extension;
};

// les annexes sont servies par un autre domaine : l’attribut download seul ouvrirait le fichier au lieu de l’enregistrer
async function downloadDocument(document: DatasheetDocument) {
    const response = await fetch(document.url);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = window.document.createElement("a");
    link.href = objectUrl;
    link.download = fileNameOf(document);
    link.click();
    URL.revokeObjectURL(objectUrl);
}

type DocumentsTabNextProps = {
    datastoreId: string;
    datasheetName: string;
};

export default function DocumentsTabNext({ datastoreId, datasheetName }: DocumentsTabNextProps) {
    const { t } = useTranslation("DocumentsTabNext");
    const { classes, cx } = useStyles();
    const queryClient = useQueryClient();
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
    const [page, setPage] = useState(1);
    const [formTarget, setFormTarget] = useState<DocumentFormTarget>();
    const [targetDocument, setTargetDocument] = useState<DatasheetDocument>();

    const { userRights, isSupervisor } = useCommunityRights();
    const canManage = isSupervisor || !!userRights?.includes(CommunityMemberDtoRightsEnum.ANNEX);

    const documentsQuery = useQuery(datasheetDocumentsQueryOptions(datastoreId, datasheetName));

    const deleteMutation = useMutation<unknown, ApiError, DatasheetDocument>({
        mutationFn: (document) => api.datasheetDocument.remove(datastoreId, datasheetName, document.id),
        onSuccess: (_, document) =>
            queryClient.setQueryData<DatasheetDocument[]>(RQKeys.datastore_datasheet_documents_list(datastoreId, datasheetName), (documents) =>
                documents?.filter((current) => current.id !== document.id)
            ),
    });

    const downloadMutation = useMutation<void, Error, DatasheetDocument>({ mutationFn: downloadDocument });
    const { mutate: download } = downloadMutation;

    // du plus récent au plus ancien ; les documents sans date d’ajout à la fin
    const sortedDocuments = useMemo(
        () => [...(documentsQuery.data ?? [])].sort((a, b) => (b.creation ?? "").localeCompare(a.creation ?? "")),
        [documentsQuery.data]
    );
    const filteredDocuments = useMemo(
        () => (typeFilter === "all" ? sortedDocuments : sortedDocuments.filter((document) => document.type === typeFilter)),
        [sortedDocuments, typeFilter]
    );
    const { paginatedItems: pageDocuments, totalPages: pageCount, page: currentPage } = usePagination(filteredDocuments, page, LIMIT);

    const openForm = useCallback((target: DocumentFormTarget) => {
        setFormTarget(target);
        formModal.open();
    }, []);
    const openAddForm = (type: DatasheetDocumentTypeEnum) => openForm({ mode: { type, editing: false } });

    // lignes mémorisées : références stables pour que memo(MenuList) évite de re-rendre les menus de chaque ligne
    const rows = useMemo(
        () =>
            pageDocuments.map((document) => {
                const isLink = document.type === DatasheetDocumentTypeEnum.Link;

                return [
                    isLink ? (
                        <a
                            key={`name-${document.id}`}
                            className={fr.cx("fr-link")}
                            href={document.url}
                            target="_blank"
                            rel="noreferrer"
                            title={`${document.name} - ${t("new_window")}`}
                        >
                            {document.name}
                        </a>
                    ) : (
                        <span key={`name-${document.id}`} title={document.name}>
                            {document.name}
                        </span>
                    ),
                    <Badge key={`format-${document.id}`} noIcon small severity="info">
                        {isLink ? t("format.link") : (formatOf(document) ?? "")}
                    </Badge>,
                    document.creation ? formatDateFromISO(document.creation) : "",
                    <MenuList
                        key={`menu-${document.id}`}
                        menuOpenButtonProps={{ iconId: "ri-more-2-line", priority: "tertiary no outline", title: t("menu.open"), size: "small" }}
                        items={[
                            canManage && {
                                text: t("menu.edit"),
                                iconId: "ri-edit-box-line",
                                onClick: () => openForm({ mode: { type: document.type, editing: true }, document }),
                            },
                            isLink
                                ? { text: t("menu.open_link"), iconId: "ri-external-link-line", linkProps: externalLinkToUrl(document.url, document.name) }
                                : { text: t("menu.download"), iconId: "ri-download-line", onClick: () => download(document) },
                            isLink && {
                                text: t("menu.copy_link"),
                                iconId: "ri-file-copy-line",
                                onClick: () => {
                                    setTargetDocument(document);
                                    TextCopyToClipboardModal.open();
                                },
                            },
                            canManage && {
                                text: t("menu.delete"),
                                iconId: "ri-delete-bin-line",
                                onClick: () => {
                                    setTargetDocument(document);
                                    deleteModal.open();
                                },
                            },
                        ]}
                    />,
                ];
            }),
        [pageDocuments, canManage, openForm, download, t]
    );

    if (documentsQuery.isPending) {
        return <LoadingText withSpinnerIcon={true} as="p" />;
    }

    if (documentsQuery.isError) {
        return <Alert severity="error" title={t("load_error")} description={getApiErrorMessage(documentsQuery.error)} small />;
    }

    const segment = ({ value, label }: (typeof FILTERS)[number]) => ({
        label: t(label),
        nativeInputProps: {
            checked: typeFilter === value,
            onChange: () => {
                setTypeFilter(value);
                setPage(1);
            },
        },
    });

    const mutationError: [string, ApiError | Error] | undefined = deleteMutation.error
        ? [t("delete_error"), deleteMutation.error]
        : downloadMutation.error
          ? [t("download_error"), downloadMutation.error]
          : undefined;

    return (
        <>
            <DatasheetViewTab>
                <h2 className={fr.cx("fr-h5", "fr-mb-4w")}>{t("title")}</h2>

                {mutationError && (
                    <Alert className={fr.cx("fr-mb-2w")} severity="error" title={mutationError[0]} description={getApiErrorMessage(mutationError[1])} small />
                )}

                {sortedDocuments.length === 0 ? (
                    <div className={classes.empty}>
                        {canManage ? (
                            <>
                                <Button onClick={() => openAddForm(DatasheetDocumentTypeEnum.File)}>{t("empty.add_file")}</Button>
                                <span className={classes.separator}>{t("or")}</span>
                                <Button priority="secondary" onClick={() => openAddForm(DatasheetDocumentTypeEnum.Link)}>
                                    {t("empty.add_link")}
                                </Button>
                            </>
                        ) : (
                            <p className={fr.cx("fr-m-0")}>{t("no_document")}</p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className={classes.toolbar}>
                            <SegmentedControl
                                hideLegend
                                legend={t("filter_legend")}
                                name="document-type-filter"
                                segments={[segment(FILTERS[0]), segment(FILTERS[1]), segment(FILTERS[2])]}
                            />
                            {canManage && (
                                <div className={classes.actions}>
                                    <Button
                                        iconId="fr-icon-add-line"
                                        priority="secondary"
                                        size="small"
                                        onClick={() => openAddForm(DatasheetDocumentTypeEnum.Link)}
                                    >
                                        {t("add_link")}
                                    </Button>
                                    <Button iconId="fr-icon-add-line" size="small" onClick={() => openAddForm(DatasheetDocumentTypeEnum.File)}>
                                        {t("add_file")}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className={cx(fr.cx("fr-mt-3w", "fr-mb-1w"), classes.results)}>
                            <p className={fr.cx("fr-text--xs", "fr-m-0")}>{t("results", { count: filteredDocuments.length })}</p>
                            <p className={fr.cx("fr-text--xs", "fr-m-0")}>{t("per_page", { count: LIMIT })}</p>
                        </div>

                        <CardRowsTable
                            caption={t("caption")}
                            noCaption
                            columnWidths={COLUMN_WIDTHS}
                            headers={[
                                t("column.name"),
                                t("column.format"),
                                t("column.creation"),
                                <span key="menu" className={fr.cx("fr-sr-only")}>
                                    {t("column.menu")}
                                </span>,
                            ]}
                            data={rows}
                        />

                        {pageCount > 1 && (
                            <div className={fr.cx("fr-grid-row", "fr-grid-row--center", "fr-mt-4w")}>
                                <Pagination
                                    count={pageCount}
                                    defaultPage={currentPage}
                                    showFirstLast
                                    getPageLinkProps={(pageNumber) => ({
                                        href: "#",
                                        onClick: (e) => {
                                            e.preventDefault();
                                            setPage(pageNumber);
                                        },
                                    })}
                                />
                            </div>
                        )}
                    </>
                )}
            </DatasheetViewTab>

            <DocumentFormModal modal={formModal} datastoreId={datastoreId} datasheetName={datasheetName} target={formTarget} />

            {createPortal(
                <deleteModal.Component
                    title={t("delete_modal.title")}
                    buttons={[
                        { children: t("cancel"), doClosesModal: true, priority: "secondary" },
                        {
                            children: t("delete_modal.confirm"),
                            onClick: () => targetDocument && deleteMutation.mutate(targetDocument),
                            doClosesModal: true,
                        },
                    ]}
                >
                    <p>
                        {targetDocument?.type === DatasheetDocumentTypeEnum.Link
                            ? t("delete_modal.link", { name: targetDocument.name })
                            : t("delete_modal.file", { name: targetDocument?.name ?? "" })}
                    </p>
                </deleteModal.Component>,
                window.document.body
            )}

            {deleteMutation.isPending && (
                <Wait>
                    <LoadingText as="h6" message={t("deleting")} withSpinnerIcon={true} />
                </Wait>
            )}

            <TextCopyToClipboardDialog title={t("copy_dialog.title")} label={t("copy_dialog.label")} text={targetDocument?.url ?? ""} />
        </>
    );
}

const useStyles = tss.withName({ DocumentsTabNext }).create({
    toolbar: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: fr.spacing("2w"),
    },
    actions: {
        display: "flex",
        flexWrap: "wrap",
        gap: fr.spacing("2w"),
    },
    results: {
        display: "flex",
        justifyContent: "space-between",
        color: fr.colors.decisions.text.mention.grey.default,
    },
    empty: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: fr.spacing("2w"),
        padding: `${fr.spacing("8w")} 0`,
        border: `1px dashed ${fr.colors.decisions.border.default.grey.default}`,
    },
    // « ou » entre deux traits, comme la maquette
    separator: {
        display: "flex",
        alignItems: "center",
        gap: fr.spacing("2w"),
        width: "50%",
        "&::before, &::after": {
            content: '""',
            flex: 1,
            borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
        },
    },
});
