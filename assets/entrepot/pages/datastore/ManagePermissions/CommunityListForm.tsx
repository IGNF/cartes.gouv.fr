import { fr } from "@codegouvfr/react-dsfr";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { FC, useState } from "react";
import "../../../../sass/pages/permission.scss";
import InputCollection from "../../../../components/Input/InputCollection/InputCollection";
import { useTranslation } from "../../../../i18n/i18n";

type CommunityListFormProps = {
    communities: { id: string; name: string }[];
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    onChange: (value: string[]) => void;
};

const CommunityListForm: FC<CommunityListFormProps> = (props: CommunityListFormProps) => {
    const { t } = useTranslation("DatastorePermissions");
    const { communities, state, stateRelatedMessage, onChange } = props;

    const [selected, setSelected] = useState<string[]>([]);
    const [freeHand, setFreeHand] = useState<string[]>([]);

    /* Changement d'etat d'une checkbox */
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let uuids = [...selected];
        const checked = event.currentTarget.checked;
        if (checked) {
            uuids.push(event.currentTarget.value);
        } else uuids = uuids.filter((id) => id !== event.currentTarget.value);

        const result = [...uuids, ...freeHand];
        onChange([...new Set(result)]);
        setSelected(uuids);
    };

    const handleFreehandChange = (values: string[]) => {
        const uuids = [...selected, ...values];
        onChange([...new Set(uuids)]);
        setFreeHand(values);
    };

    return (
        <div className={cx(fr.cx("fr-my-2v", "fr-pl-2v"), state === "error" && "frx-community-error")}>
            <Checkbox
                className={"frx-scroll-list"}
                legend={t("add_form.communities_list")}
                options={communities.map((community) => ({
                    label: community.name,
                    nativeInputProps: {
                        value: community.id,
                        onChange: (event) => handleCheckboxChange(event),
                        checked: selected.includes(community.id),
                    },
                }))}
            />
            <div className={fr.cx("fr-mb-2w")}>
                <InputCollection label={t("add_form.other_communities")} onChange={(values) => handleFreehandChange(values)} />
            </div>
            {state !== "default" && (
                <p
                    className={fr.cx(
                        (() => {
                            switch (state) {
                                case "error":
                                    return "fr-error-text";
                                case "success":
                                    return "fr-valid-text";
                            }
                        })(),
                        "fr-mb-1v"
                    )}
                >
                    {stateRelatedMessage}
                </p>
            )}
        </div>
    );
};

export default CommunityListForm;
