import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { FC, useEffect } from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { EmailPlannerFormType } from "../../../../../../@types/app_espaceco";
import { CancelEvents, TriggerEvents } from "../../../../../../@types/espaceco";
import AutocompleteSelect from "../../../../../../components/Input/AutocompleteSelect";
import MarkdownEditor from "../../../../../../components/Input/MarkdownEditor";
import { useTranslation } from "../../../../../../i18n/i18n";
import getKeywordsExtraCommands from "./EmailPlannerKeywords";
import RecipientsManager from "./RecipientsManager";

import "../../../../../../sass/components/react-md-editor.scss";

type PersonalEmailPlannerProps = {
    form: UseFormReturn<EmailPlannerFormType>;
    themes: string[];
    statuses: string[];
};

const PersonalEmailPlanner: FC<PersonalEmailPlannerProps> = ({ form, themes, statuses }) => {
    const { t } = useTranslation("AddOrEditEmailPlanner");

    const {
        control,
        watch,
        register,
        formState: { errors },
        resetField,
        setValue: setFormValue,
    } = form;

    const event = watch("event");
    const repeat = useWatch({
        control: control,
        name: "repeat",
    });

    useEffect(() => {
        if (event === "georem_created") {
            resetField("condition", undefined);
        }
    }, [resetField, event]);

    return (
        <div>
            <Input
                label={t("dialog.subject")}
                state={errors.subject ? "error" : "default"}
                stateRelatedMessage={errors?.subject?.message}
                nativeInputProps={{
                    ...register("subject"),
                }}
            />
            <h5>{t("dialog.title_1")}</h5>
            <Select
                label={t("dialog.trigger_event")}
                nativeSelectProps={{
                    ...register("event"),
                }}
            >
                {TriggerEvents.map((e) => {
                    const title = t("trigger_event", { event: e });
                    return (
                        <option key={e} value={e} title={title}>
                            {title}
                        </option>
                    );
                })}
            </Select>
            <Controller
                control={control}
                name="themes"
                render={({ field }) => {
                    return (
                        <AutocompleteSelect
                            label={t("dialog.themes")}
                            options={themes}
                            searchFilter={{ limit: 10 }}
                            onChange={(_, value) => field.onChange(value)}
                            value={field.value}
                        />
                    );
                }}
            />
            {event === "georem_status_changed" && (
                <Controller
                    control={control}
                    name="condition.status"
                    render={({ field }) => {
                        return (
                            <AutocompleteSelect
                                label={t("dialog.status")}
                                state={errors.condition?.status ? "error" : "default"}
                                stateRelatedMessage={errors.condition?.status?.message?.toString()}
                                options={statuses}
                                searchFilter={{ limit: 10 }}
                                onChange={(_, value) => field.onChange(value)}
                                value={field.value ?? []}
                            />
                        );
                    }}
                />
            )}
            <Input
                label={t("dialog.delay")}
                hintText={t("dialog.delay_hint")}
                state={errors.delay ? "error" : "default"}
                stateRelatedMessage={errors?.delay?.message}
                nativeInputProps={{
                    type: "number",
                    ...register("delay"),
                }}
            />
            <h5>{t("dialog.title_2")}</h5>
            <Select
                label={t("dialog.cancel_event")}
                hint={t("dialog.cancel_event_hint")}
                nativeSelectProps={{
                    ...register("cancel_event"),
                }}
            >
                {CancelEvents.map((e) => {
                    const title = t("cancel_event", { event: e });
                    return (
                        <option key={e} value={e} title={title}>
                            {title}
                        </option>
                    );
                })}
            </Select>
            <ToggleSwitch
                classes={{ root: fr.cx("fr-mb-6v"), hint: fr.cx("fr-mt-1v") }}
                checked={repeat === true}
                label={t("dialog.repeat")}
                helperText={t("dialog.repeat_hint")}
                showCheckedHint={false}
                onChange={(checked) => setFormValue("repeat", checked)}
            />
            <Controller
                control={control}
                name="recipients"
                render={({ field: { value, onChange } }) => (
                    <RecipientsManager
                        value={value ?? []}
                        state={errors.recipients ? "error" : "default"}
                        stateRelatedMessage={errors.recipients?.message?.toString()}
                        onChange={onChange}
                    />
                )}
            />
            <h5>{t("dialog.title_4")}</h5>
            <Controller
                control={control}
                name="body"
                render={({ field }) => (
                    <MarkdownEditor
                        label={t("dialog.body")}
                        hintText={t("dialog.body_explain")}
                        state={errors.body ? "error" : "default"}
                        stateRelatedMessage={errors?.body?.message?.toString()}
                        extraCommands={getKeywordsExtraCommands()}
                        value={field.value ?? ""}
                        onChange={(values) => {
                            field.onChange(values);
                        }}
                    />
                )}
            />
        </div>
    );
};

export default PersonalEmailPlanner;
