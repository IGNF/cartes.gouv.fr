import { fr } from "@codegouvfr/react-dsfr";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import ToggleSwitch from "@codegouvfr/react-dsfr/ToggleSwitch";
import { FC, useCallback, useEffect, useMemo } from "react";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import isEmail from "validator/lib/isEmail";
import { BasicRecipientsArray, EmailPlannerFormType } from "../../../../../../@types/app_espaceco";
import { CancelEvents, ReportStatusesDTO, ReportStatusesType, TriggerEvents } from "../../../../../../@types/espaceco";
import AutocompleteSelect from "../../../../../../components/Input/AutocompleteSelect";
import { useTranslation } from "../../../../../../i18n/i18n";
//import getKeywordsExtraCommands from "./EmailPlannerControls";

import HtmlEditor from "../../../../../../components/Input/HtmlEditor";
import "../../../../../../sass/components/react-md-editor.scss";
import EmailPlannerControls from "./EmailPlannerControls";

type PersonalEmailPlannerProps = {
    form: UseFormReturn<EmailPlannerFormType>;
    themes: string[];
    statuses: ReportStatusesDTO;
};

type StatusAutocompleteOption = {
    status: ReportStatusesType;
    title: string;
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
            resetField("statuses", { defaultValue: [] });
        }
    }, [resetField, event]);

    const options = useMemo<StatusAutocompleteOption[]>(() => {
        const options = Object.keys(statuses).reduce((accumulator, status) => {
            accumulator[status] = { title: statuses[status].title, status: status };
            return accumulator;
        }, {});
        return Object.values(options);
    }, [statuses]);

    const getValue = useCallback(
        (value?: string[]) => {
            if (!value) return [];

            const options = Object.keys(statuses).reduce((accumulator, status) => {
                if (value.includes(status)) {
                    accumulator[status] = { title: statuses[status].title, status: status };
                }
                return accumulator;
            }, {});
            return Object.values(options);
        },
        [statuses]
    );

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
                            state={errors.themes ? "error" : "default"}
                            stateRelatedMessage={errors.themes?.message?.toString()}
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
                    name={"statuses"}
                    render={({ field }) => {
                        return (
                            <AutocompleteSelect
                                label={t("dialog.status")}
                                state={errors.statuses ? "error" : "default"}
                                stateRelatedMessage={errors.statuses?.message?.toString()}
                                options={options}
                                getOptionLabel={(option) => (option as StatusAutocompleteOption).title}
                                isOptionEqualToValue={(option, value) => {
                                    const optionStatus = (option as StatusAutocompleteOption).status;
                                    const valueStatus = (value as StatusAutocompleteOption).status;
                                    return optionStatus === valueStatus;
                                }}
                                searchFilter={{ limit: 10 }}
                                onChange={(_, value) => {
                                    const selected = value as StatusAutocompleteOption[];
                                    field.onChange(selected.map((s) => s.status));
                                }}
                                value={getValue(field.value)}
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
            <h5>{t("dialog.recipients")}</h5>
            <Controller
                control={control}
                name="recipients"
                render={({ field: { value, onChange } }) => (
                    <AutocompleteSelect
                        label={""}
                        state={errors.recipients ? "error" : "default"}
                        stateRelatedMessage={errors.recipients?.message?.toString()}
                        freeSolo={true}
                        options={BasicRecipientsArray}
                        isOptionEqualToValue={(option, value) => {
                            return option === value;
                        }}
                        searchFilter={{ limit: 10 }}
                        onChange={(_, value) => {
                            if (value && Array.isArray(value)) {
                                value = value.filter((v) => {
                                    if (BasicRecipientsArray.includes(v)) return true;
                                    return isEmail(v);
                                });
                                onChange(value);
                            }
                        }}
                        value={value}
                    />
                )}
            />
            <h5>{t("dialog.title_4")}</h5>
            <Controller
                control={control}
                name="body"
                render={({ field }) => (
                    <HtmlEditor
                        label={t("dialog.body")}
                        hintText={t("dialog.body_explain")}
                        state={errors.body ? "error" : "default"}
                        stateRelatedMessage={errors?.body?.message?.toString()}
                        extraControls={EmailPlannerControls}
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
