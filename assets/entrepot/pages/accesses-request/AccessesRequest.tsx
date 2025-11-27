import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import ButtonsGroup from "@codegouvfr/react-dsfr/ButtonsGroup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { ComponentProps, FC, ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import { catalogueUrl } from "@/env";
import { GeonetworkMetadataResponse } from "../../../@types/app";
import LoadingText from "../../../components/Utils/LoadingText";
import Wait from "../../../components/Utils/Wait";
import { useTranslation } from "../../../i18n/i18n";
import SymfonyRouting from "../../../modules/Routing";
import RQKeys from "../../../modules/entrepot/RQKeys";
import { CartesApiException, jsonFetch } from "../../../modules/jsonFetch";
import { routes } from "../../../router/router";
import { useAuthStore } from "../../../stores/AuthStore";
import api from "../../api";
import Main from "../../../components/Layout/Main";

type AskForAccesses = {
    fileIdentifier: string;
};

const AccessesRequest: FC<AskForAccesses> = ({ fileIdentifier }) => {
    const { t } = useTranslation({ AccessesRequest });
    const { t: tCommon } = useTranslation("Common");

    const user = useAuthStore((state) => state.user);

    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState<string | undefined>(undefined);

    const query = useQuery<GeonetworkMetadataResponse, CartesApiException>({
        queryKey: RQKeys.accesses_request(fileIdentifier),
        queryFn: ({ signal }) => api.geonetwork.getMetadataInfos(fileIdentifier, { signal }),
        staleTime: 3600000,
    });

    const catalogueDatasheetUrl = useMemo(() => `${catalogueUrl}/dataset/${fileIdentifier}`, [fileIdentifier]);
    const myCommunities = useMemo(() => {
        return Array.from(user?.communities_member ?? [], (member) => member.community);
    }, [user]);

    const schema = yup.object({
        layers: yup.array().of(yup.string()).min(1, t("min_layers_error")).required(),
        myself: yup.boolean(),
        beneficiaries: yup.array().of(yup.string()).required(),
    });

    // Formulaire
    const {
        register,
        setValue,
        getValues: getFormValues,
        formState: { errors },
        watch,
        handleSubmit,
    } = useForm({ mode: "onSubmit", defaultValues: { layers: [], myself: true, beneficiaries: [] }, resolver: yupResolver(schema) });

    const myself = watch("myself");
    const beneficiaries = watch("beneficiaries"); // Les communautes beneficiaires

    const beneficiariesOptions = useMemo(() => {
        const options: {
            label: ReactNode;
            hintText?: ReactNode;
            nativeInputProps: ComponentProps<"input">;
        }[] = [];
        myCommunities.forEach((community) => {
            options.push({
                label: t("community", { name: community?.name ?? "" }),
                nativeInputProps: {
                    ...register("beneficiaries"),
                    checked: beneficiaries.includes(community?._id),
                    value: community?._id,
                },
            });
        });
        return options;
    }, [myCommunities, beneficiaries, t, register]);

    const onSubmit = () => {
        const values = getFormValues();
        const layers = query.data?.private_layers.filter((layer) => values["layers"].includes(layer.name));

        const body = {
            emailContact: query.data?.contact_email,
            catalogueDatasheetUrl: catalogueDatasheetUrl,
            layers: layers,
        };

        const beneficiaries = [...values["beneficiaries"]];
        if (!beneficiaries.length) {
            body["myself"] = true;
        }

        if (beneficiaries.length > 1) {
            body["beneficiaries"] = myCommunities.filter((c) => beneficiaries.includes(c?._id));
        }

        setSendError(undefined);
        setIsSending(true);

        const url = SymfonyRouting.generate("cartesgouvfr_contact_accesses_request");
        jsonFetch<{ state: string; message?: string }>(url, { method: "POST" }, body)
            .then((response) => {
                if (response.state === "success") {
                    routes.dashboard().push();
                } else setSendError(response.message);
            })
            .catch((error) => {
                setSendError(error.message);
            })
            .finally(() => setIsSending(false));
    };

    return (
        <Main>
            {query.error ? (
                <Alert
                    severity="error"
                    closable={false}
                    title={query.error.message}
                    description={<Button linkProps={routes.dashboard().link}>{t("back_to_dashboard")}</Button>}
                />
            ) : (
                <>
                    <h1>{t("title")}</h1>
                    {query.isLoading ? (
                        <LoadingText />
                    ) : sendError !== undefined ? (
                        <Alert severity={"error"} title={tCommon("error")} description={sendError} className={fr.cx("fr-my-3w")} />
                    ) : query.data?.private_layers.length ? (
                        <div>
                            {t("explain", { url: catalogueDatasheetUrl })}
                            <Checkbox
                                legend={null}
                                options={query.data?.private_layers.map((layer) => {
                                    const label = (
                                        <span>
                                            {layer.name}
                                            {layer.endpointType && (
                                                <Badge noIcon={true} severity={"info"} className={fr.cx("fr-ml-2v")}>
                                                    {layer.endpointType}
                                                </Badge>
                                            )}
                                        </span>
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
                            <Checkbox
                                legend={t("beneficiaries")}
                                hintText={t("beneficiaries_hintext")}
                                options={[
                                    {
                                        label: t("myself"),
                                        nativeInputProps: {
                                            onChange: (e) => {
                                                const checked = e.currentTarget.checked;
                                                setValue("myself", checked);
                                            },
                                            checked: myself === true,
                                            value: "myself",
                                        },
                                    },
                                ]}
                            />
                            <Checkbox legend={null} options={beneficiariesOptions} />
                            <ButtonsGroup
                                buttons={[
                                    {
                                        linkProps: routes.dashboard().link,
                                        children: t("back_to_dashboard"),
                                        priority: "secondary",
                                    },
                                    {
                                        children: tCommon("send"),
                                        onClick: handleSubmit(onSubmit),
                                    },
                                ]}
                                inlineLayoutWhen="always"
                                alignment="right"
                                className={fr.cx("fr-mt-2w")}
                            />
                        </div>
                    ) : (
                        <div>
                            <p>{t("explain_no_access")}</p>
                            <Button linkProps={routes.dashboard().link}>{t("back_to_dashboard")}</Button>
                        </div>
                    )}
                </>
            )}
            {isSending && (
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
