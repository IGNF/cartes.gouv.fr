import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { FC, useMemo } from "react";
import { useTranslation } from "../../../../../i18n/i18n";
import { createPortal } from "react-dom";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { fr } from "@codegouvfr/react-dsfr";
import { SharedThemesDTO } from "../../../../../@types/espaceco";

export type UserSharedThemesType = Record<number, { communityName: string; themes: string[] }>;
export type SharedThemesType = Record<number, string[]>;

const SetSharedThemesDialogModal = createModal({
    id: "set-shared-themes",
    isOpenedByDefault: false,
});

type SetSharedThemesDialogProps = {
    userSharedThemes: UserSharedThemesType;
    sharedThemes: SharedThemesType;
    onApply: (values: SharedThemesDTO[]) => void;
};

type formType = {
    shared_themes: Record<number, string[]>;
};

const SetSharedThemesDialog: FC<SetSharedThemesDialogProps> = ({ userSharedThemes, sharedThemes, onApply }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t } = useTranslation("SharedThemes");

    const schema = yup
        .object({
            shared_themes: yup.lazy(() => {
                const ret = {};
                Object.keys(userSharedThemes).forEach((community) => {
                    ret[community] = yup.array().of(yup.string()).required();
                });
                return yup.object().shape(ret).required();
            }),
        })
        .required();

    const defaultValues = useMemo(() => {
        const def: formType["shared_themes"] = {};

        Object.keys(userSharedThemes).forEach((community) => {
            const themes: string[] = userSharedThemes[community].themes.filter((th) => {
                return community in sharedThemes && sharedThemes[community].includes(th);
            });
            def[community] = themes;
        });
        return { shared_themes: def };
    }, [userSharedThemes, sharedThemes]);

    const {
        watch,
        register,
        getValues: getFormValues,
        handleSubmit,
    } = useForm<formType>({
        mode: "onSubmit",
        resolver: yupResolver(schema),
        values: defaultValues,
    });

    const shared = watch("shared_themes");

    const onSubmit = () => {
        SetSharedThemesDialogModal.close();
        const values = getFormValues("shared_themes");

        const sharedThemes: SharedThemesDTO[] = [];
        Object.keys(values).forEach((community) => {
            if (values[community].length) {
                const communityName = userSharedThemes[community].communityName;
                sharedThemes.push({ community_id: Number(community), community_name: communityName, themes: values[community] });
            }
        });
        onApply(sharedThemes);
    };

    return createPortal(
        <SetSharedThemesDialogModal.Component
            title={t("dialog.title")}
            buttons={[
                {
                    children: tCommon("cancel"),
                    doClosesModal: true,
                    priority: "secondary",
                },
                {
                    children: tCommon("apply"),
                    doClosesModal: false,
                    onClick: handleSubmit(onSubmit),
                    priority: "primary",
                },
            ]}
        >
            <div>
                {Object.keys(userSharedThemes).map((community) => {
                    const options = userSharedThemes[community].themes.map((theme) => ({
                        label: theme,
                        nativeInputProps: {
                            value: theme,
                            checked: shared[community].includes(theme),
                            // @ts-expect-error ???
                            ...register(`shared_themes.${community}`),
                        },
                    }));
                    return (
                        <Checkbox
                            key={community}
                            classes={{ content: fr.cx("fr-ml-8w") }}
                            legend={userSharedThemes[community].communityName}
                            options={options}
                        />
                    );
                })}
            </div>
        </SetSharedThemesDialogModal.Component>,
        document.body
    );
};

export { SetSharedThemesDialogModal, SetSharedThemesDialog };
