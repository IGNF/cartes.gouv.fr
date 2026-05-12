import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { TagProps } from "@codegouvfr/react-dsfr/Tag";
import TagsGroup, { TagsGroupProps } from "@codegouvfr/react-dsfr/TagsGroup";
import { Autocomplete, AutocompleteProps, CreateFilterOptionsConfig, TextField, createFilterOptions } from "@mui/material";
import { FocusEvent, ReactNode, SyntheticEvent, useId } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { symToStr } from "tsafe/symToStr";
import { useStyles } from "tss-react/mui";

interface AutocompleteSelectNewProps<T> extends Partial<AutocompleteProps<T, boolean, boolean, boolean>> {
    id?: string;
    label: ReactNode;
    hintText?: ReactNode;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    searchFilter?: CreateFilterOptionsConfig<T>;
    controllerField?: ControllerRenderProps;
}

const defaultProps = {
    searchFilter: {
        ignoreAccents: true,
        ignoreCase: true,
        limit: 10,
    },
    freeSolo: false,
    multiple: true,
    autoComplete: true,
    disablePortal: true,
    forcePopupIcon: true,
    options: [],
} satisfies Partial<AutocompleteSelectNewProps<unknown>>;

const AutocompleteSelectNew = <T,>(props: AutocompleteSelectNewProps<T>) => {
    const {
        id,
        label,
        hintText,
        state = "default",
        stateRelatedMessage,
        searchFilter,
        controllerField,
        options = defaultProps.options as T[],
        multiple = defaultProps.multiple,
        freeSolo = defaultProps.freeSolo,
        autoComplete = defaultProps.autoComplete,
        disablePortal = defaultProps.disablePortal,
        forcePopupIcon = defaultProps.forcePopupIcon,
        defaultValue,
        getOptionLabel,
        isOptionEqualToValue,
        value,
        onChange,
        onBlur,
        classes,
        renderValue,
        ...restProps
    } = props;

    const inputId = (function useClosure() {
        const _id = useId();
        return id ?? `${symToStr({ AutocompleteSelectNew })}-${_id}`;
    })();

    const messageId = `${inputId}-msg`;
    const hasStateMessage = state !== "default" && Boolean(stateRelatedMessage);

    const resolveOptionLabel = (option: T | string | null | undefined): string => {
        if (option === null || option === undefined) {
            return "";
        }

        if (typeof option === "string") {
            return option;
        }

        return getOptionLabel ? getOptionLabel(option) : String(option);
    };

    const componentDefaultValue = multiple ? [] : null;

    const handleChange = (event: SyntheticEvent, nextValue: unknown, reason: string, details?: unknown) => {
        onChange?.(event, nextValue as never, reason as never, details as never);
        if (controllerField !== undefined && onChange === undefined) {
            controllerField.onChange(nextValue);
        }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        controllerField?.onBlur();
    };

    const defaultRenderValue: NonNullable<AutocompleteProps<T, boolean, boolean, boolean>["renderValue"]> = (selectedValue, getItemProps) => {
        return (
            <TagsGroup
                tags={
                    (Array.isArray(selectedValue) ? selectedValue : [selectedValue])
                        .filter((item) => item !== null && item !== undefined)
                        .map((tag, index) => {
                            const { onDelete, className, disabled, tabIndex } = getItemProps({ index });

                            return {
                                children: <>{resolveOptionLabel(tag as T | string)}</>,
                                dismissible: true,
                                as: "button",
                                nativeButtonProps: {
                                    onClick: (event) => onDelete?.(event),
                                    className: [className, "fr-m-1v fr-my-2v"].filter(Boolean).join(" "),
                                    disabled,
                                    tabIndex,
                                },
                            } satisfies TagProps;
                        }) as unknown as TagsGroupProps["tags"]
                }
            />
        );
    };

    const { css, cx } = useStyles();

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error")}>
                <label className={fr.cx("fr-label")} htmlFor={inputId}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
                <Autocomplete
                    {...controllerField}
                    {...restProps}
                    id={inputId}
                    aria-describedby={hasStateMessage ? messageId : undefined}
                    autoComplete={autoComplete}
                    freeSolo={freeSolo}
                    multiple={multiple}
                    filterSelectedOptions={multiple}
                    disablePortal={disablePortal}
                    forcePopupIcon={forcePopupIcon}
                    filterOptions={createFilterOptions({ ...defaultProps.searchFilter, ...searchFilter })}
                    options={options}
                    defaultValue={(defaultValue ?? componentDefaultValue) as never}
                    value={(value ?? controllerField?.value) as never}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    getOptionLabel={resolveOptionLabel as never}
                    isOptionEqualToValue={isOptionEqualToValue}
                    renderInput={(params) => <TextField {...params} variant={"filled"} size={"small"} error={state === "error"} />}
                    renderValue={multiple ? (renderValue ?? defaultRenderValue) : renderValue}
                    classes={{
                        inputRoot: cx(
                            fr.cx("fr-py-0", "fr-pl-3v"),
                            css({
                                // style d'un input dsfr
                                borderRadius: "0.25rem 0.25rem 0 0",
                                boxShadow: "inset 0 -2px 0 0 var(--border-plain-grey)",
                            })
                        ),
                        input: fr.cx("fr-py-3v"),
                        endAdornment: fr.cx("fr-mr-1v"),
                        popper: css({
                            zIndex: "999999 !important",
                        }),
                        ...classes,
                    }}
                />

                {hasStateMessage && (
                    <p
                        id={messageId}
                        className={fr.cx(
                            (() => {
                                switch (state) {
                                    case "error":
                                        return "fr-error-text";
                                    case "success":
                                        return "fr-valid-text";
                                }
                            })()
                        )}
                    >
                        {stateRelatedMessage}
                    </p>
                )}
            </div>
        </MuiDsfrThemeProvider>
    );
};

export default AutocompleteSelectNew;
