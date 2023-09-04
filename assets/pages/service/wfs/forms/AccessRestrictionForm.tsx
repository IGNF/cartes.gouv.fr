import { fr } from "@codegouvfr/react-dsfr";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import { yupResolver } from "@hookform/resolvers/yup";
import { FC } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

import Translator from "../../../../modules/Translator";
import { useQuery } from "@tanstack/react-query";
import { DatastoreEndpoint } from "../../../../types/app";
import RQKeys from "../../../../modules/RQKeys";
import api from "../../../../api";

type AccessRestrictionFormProps = {
    datastoreId: string;
    visible: boolean;
    onPrevious: () => void;
    onValid: (values) => void;
};

const schema = yup.object({
    share_with: yup.string().required(Translator.trans("service.wfs.new.access_retrictions.share_with_error")),
});

const AccessRestrictionForm: FC<AccessRestrictionFormProps> = ({ datastoreId, visible, onPrevious, onValid }) => {
    const abortController = new AbortController();

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues: getFormValues,
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = () => {
        const values = getFormValues();
        onValid(values);
    };

    const endpointsQuery = useQuery<DatastoreEndpoint[]>({
        queryKey: RQKeys.datastore_endpoints(datastoreId),
        queryFn: () => api.datastore.getEndpoints(datastoreId, {}, { signal: abortController?.signal }),
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
            <h3>{Translator.trans("service.wfs.new.access_retrictions.title")}</h3>

            <p>{Translator.trans("mandatory_fields")}</p>

            <RadioButtons
                legend={Translator.trans("service.wfs.new.access_retrictions.share_with")}
                state={errors.share_with ? "error" : "default"}
                stateRelatedMessage={errors?.share_with?.message}
                options={[
                    {
                        label: Translator.trans("service.wfs.new.access_retrictions.share_with_choices.all_public"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "all_public",
                            disabled: wfsPublicEndpoints?.length === 0,
                        },
                    },
                    {
                        label: Translator.trans("service.wfs.new.access_retrictions.share_with_choices.your_community"),
                        nativeInputProps: {
                            ...register("share_with"),
                            value: "your_community",
                            disabled: wfsPrivateEndpoints?.length === 0,
                        },
                    },
                    {
                        label: Translator.trans("service.wfs.new.access_retrictions.share_with_choices.communities_or_users"),
                        nativeInputProps: {
                            ...register("share_with"),
                            disabled: true, // TODO : désactivé pour l'instant parce que plus d'info est nécessaire sur la fonctionnalité
                        },
                    },
                ]}
            />

            <ButtonsGroup
                className={fr.cx("fr-my-2v")}
                alignment="between"
                buttons={[
                    {
                        children: Translator.trans("previous_step"),
                        iconId: "fr-icon-arrow-left-fill",
                        onClick: onPrevious,
                    },
                    {
                        children: Translator.trans("service.wfs.new.publish"),
                        onClick: handleSubmit(onSubmit),
                    },
                ]}
                inlineLayoutWhen="always"
            />
        </div>
    );
};

export default AccessRestrictionForm;
