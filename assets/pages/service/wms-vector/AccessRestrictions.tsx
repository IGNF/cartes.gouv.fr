import { useQuery } from "@tanstack/react-query";
import { FC } from "react";
import { UseFormReturn } from "react-hook-form";
import { DatastoreEndpoint } from "../../../types/app";
import api from "../../../api";
import RQKeys from "../../../modules/RQKeys";
import Translator from "../../../modules/Translator";
import { fr } from "@codegouvfr/react-dsfr";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

type AccessRestrictionProps = {
    datastoreId: string;
    visible: boolean;
    form: UseFormReturn;
};
const AccessRestrictions: FC<AccessRestrictionProps> = ({ datastoreId, visible, form }) => {
    const {
        register,
        formState: { errors },
    } = form;

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: ({ signal }) => api.datastore.getEndpoints(datastoreId, {}, { signal }),
        retry: false,
        staleTime: 3600000,
    });

    const wfsPublicEndpoints = Array.isArray(endpointsQuery?.data)
        ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS" && endpoint.endpoint.open === true)
        : [];
    const wfsPrivateEndpoints = Array.isArray(endpointsQuery?.data)
        ? endpointsQuery?.data?.filter((endpoint) => endpoint.endpoint.type.toUpperCase() === "WFS" && endpoint.endpoint.open === false)
        : [];

    return (
        <div className={fr.cx("fr-my-2v", !visible && "fr-hidden")}>
            <h3>{Translator.trans("service.wms_vector.new.step_access_retrictions.title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <RadioButtons
                legend={Translator.trans("service.wms_vector.new.step_access_retrictions.share_with")}
                state={errors.share_with ? "error" : "default"}
                stateRelatedMessage={errors?.share_with?.message?.toString()}
                options={[
                    {
                        label: Translator.trans("service.wms_vector.new.step_access_retrictions.share_with_choices.all_public"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "all_public",
                            disabled: wfsPublicEndpoints?.length === 0,
                        },
                    },
                    {
                        label: Translator.trans("service.wms_vector.new.step_access_retrictions.share_with_choices.your_community"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "your_community",
                            disabled: wfsPrivateEndpoints?.length === 0,
                        },
                    },
                    {
                        label: Translator.trans("service.wms_vector.new.step_access_retrictions.share_with_choices.communities_or_users"),
                        nativeInputProps: {
                            ...register("share_with"),
                            disabled: true, // TODO : désactivé pour l'instant parce que plus d'info est nécessaire sur la fonctionnalité
                        },
                    },
                ]}
            />
        </div>
    );
};

export default AccessRestrictions;
