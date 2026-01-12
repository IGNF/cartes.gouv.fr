import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Input from "@codegouvfr/react-dsfr/Input";
import Success from "@codegouvfr/react-dsfr/picto/Success";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useStyles } from "tss-react";
import * as yup from "yup";

import { catalogueUrl } from "@/env";
import { CswMetadata } from "../../../@types/app";
import Main from "../../../components/Layout/Main";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { getTranslation, useTranslation } from "../../../i18n/i18n";
import RQKeys from "../../../modules/entrepot/RQKeys";
import { CartesApiException } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useAuthStore } from "../../../stores/AuthStore";
import api from "../../api";

import placeholder1x1Url from "@/img/placeholder.1x1.png";

const { t } = getTranslation("AccessesRequest");

const MYSELF = "myself";
const schema = yup.object({
    layers: yup.array().of(yup.string()).min(1, t("form.layers.error.at_least_one")).required(),
    beneficiaries: yup.array().of(yup.string()).min(1, t("form.beneficiaries.error.at_least_one")).required(),
    message: yup.string().optional(),
});

function gmdProtocolToServiceType(protocol: string): string {
    return protocol.replaceAll("OGC:", "");
}

type AskForAccesses = {
    fileIdentifier: string;
};

const AccessesRequest: FC<AskForAccesses> = ({ fileIdentifier }) => {
    const { t } = useTranslation({ AccessesRequest });
    const { t: tCommon } = useTranslation("Common");

    const user = useAuthStore((state) => state.user);

    const metadataQuery = useQuery<CswMetadata, CartesApiException>({
        queryKey: RQKeys.accesses_request(fileIdentifier),
        queryFn: ({ signal }) => api.geonetwork.getMetadataInfos(fileIdentifier, { signal }),
        staleTime: 3600000,
    });

    const privateLayers = useMemo(() => metadataQuery.data?.layers?.filter((l) => !l.open) ?? [], [metadataQuery.data]);
    const catalogueDatasheetUrl = useMemo(() => `${catalogueUrl}/dataset/${fileIdentifier}`, [fileIdentifier]);

    const myCommunities = useMemo(() => {
        return Array.from(user?.communities_member ?? [], (member) => member.community);
    }, [user]);

    const {
        register,
        formState: { errors },
        handleSubmit,
        reset: resetForm,
    } = useForm({
        defaultValues: {
            layers: [],
            beneficiaries: [MYSELF],
        },
        resolver: yupResolver(schema),
    });

    const requestMutation = useMutation({
        mutationFn: (data: object) => {
            return api.contact.requestPrivateServicesAccess(data);
        },
    });

    const onSubmit = (data: object) => {
        data["file_identifier"] = fileIdentifier;
        data["email_contact"] = metadataQuery.data?.contact_email;

        data["layers"] = privateLayers.filter((layer) => data["layers"].includes(layer.name));
        data["myself"] = data["beneficiaries"].includes(MYSELF);
        data["beneficiaries"] = myCommunities.filter((c) => data["beneficiaries"].includes(c?._id));

        requestMutation.mutate(data);
    };

    const { css, cx } = useStyles();

    return (
        <Main title={t("title")}>
            <div className={fr.cx("fr-mb-16v")}>
                <h1 className={fr.cx("fr-mb-2w")}>{t("title")}</h1>
                <p>{t("explanation")}</p>
            </div>

            {metadataQuery.isLoading ? (
                <LoadingText as="h2" />
            ) : metadataQuery.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={metadataQuery.error.message}
                    description={<Button linkProps={routes.dashboard().link}>{t("back_to_dashboard")}</Button>}
                />
            ) : (
                metadataQuery.data !== undefined && (
                    <>
                        <div className={css({ display: "flex", gap: "2rem", flexDirection: "column", [fr.breakpoints.up("sm")]: { flexDirection: "row" } })}>
                            <img
                                src={metadataQuery.data?.thumbnail_url ?? placeholder1x1Url}
                                alt=""
                                className={css({
                                    width: "9rem",
                                    height: "9rem",
                                    objectFit: "cover",
                                })}
                            />

                            <div
                                className={css({
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "hidden",
                                    gap: "0.75rem",
                                })}
                            >
                                <strong>{metadataQuery.data?.title}</strong>
                                <p
                                    className={css({
                                        textOverflow: "ellipsis",
                                        overflow: "hidden",
                                        height: "4.5rem",
                                        margin: 0,
                                        WebkitLineClamp: 3,
                                        display: "-webkit-box",
                                        WebkitBoxOrient: "vertical",
                                    })}
                                >
                                    {metadataQuery.data?.abstract}
                                </p>
                                <p
                                    className={cx(
                                        fr.cx("fr-text--sm", "fr-icon-bank-line", "fr-icon--sm", "fr-m-0"),
                                        css({
                                            color: fr.colors.decisions.text.default.grey.default,
                                            "::before": { marginRight: "0.5rem" },
                                        })
                                    )}
                                >
                                    {metadataQuery.data?.organisation_name}
                                </p>
                            </div>
                        </div>
                        <hr className={fr.cx("fr-mt-10v", "fr-pb-10v")} />

                        {privateLayers.length === 0 ? (
                            <div>
                                <p>{t("explanation_no_private_services")}</p>
                                <Button linkProps={routes.dashboard().link}>{t("back_to_dashboard")}</Button>
                            </div>
                        ) : requestMutation.isError ? (
                            <Alert
                                severity={"error"}
                                title={tCommon("error")}
                                description={requestMutation.error.message}
                                className={fr.cx("fr-my-3w")}
                                closable
                                onClose={() => {
                                    metadataQuery.refetch();
                                    resetForm();
                                    requestMutation.reset();
                                }}
                            />
                        ) : requestMutation.isSuccess ? (
                            <div
                                className={css({
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: "1rem",
                                    alignItems: "center",
                                    alignSelf: "stretch",
                                    gap: "1rem",
                                })}
                            >
                                <Success color="blue-cumulus" width={"4rem"} height={"4rem"} />
                                <p>{t("request_sent_successfully")}</p>
                                <Button linkProps={{ href: catalogueDatasheetUrl }}>{t("back_to_catalogue")}</Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <Checkbox
                                    legend={t("form.layers.label")}
                                    options={privateLayers.map((layer) => {
                                        const label = (
                                            <div
                                                className={css({
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "0.75rem",
                                                    flexDirection: "column",
                                                    [fr.breakpoints.up("md")]: { flexDirection: "row", alignItems: "center" },
                                                })}
                                            >
                                                <span>{layer.description}</span>
                                                <span
                                                    className={cx(
                                                        fr.cx("fr-text--xs", "fr-m-0"),
                                                        css({ color: fr.colors.decisions.text.mention.grey.default })
                                                    )}
                                                >
                                                    {layer.name}
                                                </span>
                                                {layer.gmd_online_resource_protocol && (
                                                    <Badge noIcon={true} severity={"info"} className={fr.cx("fr-p-1v")} small as="span">
                                                        {gmdProtocolToServiceType(layer.gmd_online_resource_protocol)}
                                                    </Badge>
                                                )}
                                            </div>
                                        );
                                        return {
                                            label: label,
                                            nativeInputProps: {
                                                ...register("layers"),
                                                value: layer.name,
                                            },
                                        };
                                    })}
                                    state={errors.layers ? "error" : "default"}
                                    stateRelatedMessage={errors?.layers?.message?.toString()}
                                />
                                <hr className={fr.cx("fr-mt-10v", "fr-pb-10v")} />
                                <Checkbox
                                    legend={t("form.beneficiaries.label")}
                                    hintText={t("form.beneficiaries.hint")}
                                    state={errors.beneficiaries ? "error" : "default"}
                                    stateRelatedMessage={errors?.beneficiaries?.message?.toString()}
                                    options={[
                                        {
                                            label: t("myself"),
                                            nativeInputProps: {
                                                ...register("beneficiaries"),
                                                value: MYSELF,
                                            },
                                        },
                                        ...myCommunities.map((community) => ({
                                            label: t("community", { name: community?.name ?? "" }),
                                            nativeInputProps: {
                                                ...register("beneficiaries"),
                                                value: community?._id,
                                            },
                                        })),
                                    ]}
                                />
                                <hr className={fr.cx("fr-mt-10v", "fr-pb-10v")} />
                                <div className={fr.cx("fr-col-12", "fr-col-sm-8")}>
                                    <Input
                                        label={t("form.message.label")}
                                        hintText={t("form.message.hint")}
                                        textArea
                                        nativeTextAreaProps={{ ...register("message"), rows: 4 }}
                                        state={errors.message ? "error" : "default"}
                                        stateRelatedMessage={errors?.message?.message?.toString()}
                                    />
                                </div>
                                <Button type="submit" className={fr.cx("fr-my-6v")}>
                                    {t("send_request")}
                                </Button>
                            </form>
                        )}
                    </>
                )
            )}

            {requestMutation.isPending && (
                <Wait>
                    <div className={fr.cx("fr-container")}>
                        <div className={fr.cx("fr-grid-row", "fr-grid-row--middle")}>
                            <div className={fr.cx("fr-col-2")}>
                                <i className={fr.cx("fr-icon-refresh-line", "fr-icon--lg") + " frx-icon-spin"} />
                            </div>
                            <div className={fr.cx("fr-col-10")}>
                                <h6 className={fr.cx("fr-h6", "fr-m-0")}>{t("sending_message")}</h6>
                            </div>
                        </div>
                    </div>
                </Wait>
            )}
        </Main>
    );
};

export default AccessesRequest;
