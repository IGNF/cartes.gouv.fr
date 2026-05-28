import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import TagsGroup, { TagsGroupProps } from "@codegouvfr/react-dsfr/TagsGroup";
import {
    Autocomplete,
    AutocompleteChangeDetails,
    AutocompleteChangeReason,
    AutocompleteProps,
    CreateFilterOptionsConfig,
    TextField,
    createFilterOptions,
} from "@mui/material";
import { ForwardedRef, ReactElement, ReactNode, RefAttributes, SyntheticEvent, forwardRef, useId } from "react";
import { symToStr } from "tsafe/symToStr";
import { useStyles } from "tss-react/mui";

interface AutocompleteSelectExtraProps<T> {
    id?: string;
    label: ReactNode;
    hintText?: ReactNode;
    state?: "default" | "error" | "success";
    stateRelatedMessage?: string;
    searchFilter?: CreateFilterOptionsConfig<T>;
}

type AutocompleteSelectProps<
    T,
    M extends boolean | undefined = true,
    D extends boolean | undefined = false,
    F extends boolean | undefined = false,
> = AutocompleteSelectExtraProps<T> & Omit<AutocompleteProps<T, M, D, F>, "renderInput">;

type AutocompleteSelectBaseProps = AutocompleteSelectProps<unknown, boolean | undefined, boolean | undefined, boolean | undefined>;

const defaultSearchFilter = {
    ignoreAccents: true,
    ignoreCase: true,
    limit: 10,
} satisfies CreateFilterOptionsConfig<unknown>;

function AutocompleteSelectInner(props: AutocompleteSelectBaseProps, ref: ForwardedRef<HTMLInputElement>) {
    const {
        id,
        label,
        hintText,
        state = "default",
        stateRelatedMessage,
        searchFilter = defaultSearchFilter,
        options,
        multiple,
        value,
        onChange,
        autoComplete = true,
        disablePortal = true,
        getOptionLabel,
        isOptionEqualToValue,
        classes,
        renderValue,
        filterOptions,
        popupIcon = <span className={fr.cx("fr-icon-arrow-down-s-line", "fr-icon--sm")} />,
        clearIcon = null,
        forcePopupIcon = true,
        ...restProps
    } = props;

    const generatedId = useId();
    const inputId = id ?? `${symToStr({ AutocompleteSelect })}-${generatedId}`;

    const { css, cx } = useStyles();

    const messageId = `${inputId}-msg`;
    const hasStateMessage = state !== "default" && Boolean(stateRelatedMessage);

    type OptionLike = Parameters<NonNullable<AutocompleteSelectBaseProps["getOptionLabel"]>>[0];

    const resolveOptionLabel = (option: OptionLike): string => {
        if (option === null || option === undefined) {
            return "";
        }

        if (getOptionLabel) {
            return getOptionLabel(option);
        }

        if (typeof option === "string") {
            return option;
        }

        return String(option);
    };

    const handleRemoveTag = (tagToRemove: OptionLike, event: SyntheticEvent) => {
        const currentValue = Array.isArray(value) ? value : [];
        const newValue = currentValue.filter((v) => (isOptionEqualToValue ? !isOptionEqualToValue(v as never, tagToRemove as never) : v !== tagToRemove));
        onChange?.(event, newValue as never, "removeOption" as AutocompleteChangeReason, { option: tagToRemove } as AutocompleteChangeDetails<unknown>);
    };

    const multipleSelectedTags = multiple && Array.isArray(value) && value.length > 0 ? value : null;

    const resolvedRenderValue = (multiple ? (renderValue ?? (() => null)) : renderValue) as AutocompleteSelectBaseProps["renderValue"] | undefined;

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error", state === "success" && "fr-input-group--valid")}>
                <label className={fr.cx("fr-label")} htmlFor={inputId}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
                {multipleSelectedTags && (
                    <TagsGroup
                        tags={
                            multipleSelectedTags
                                .filter((item) => item !== null && item !== undefined)
                                .map((tag) => ({
                                    children: resolveOptionLabel(tag as OptionLike),
                                    dismissible: true,
                                    as: "button",
                                    nativeButtonProps: {
                                        type: "button",
                                        onClick: (event) => handleRemoveTag(tag as OptionLike, event),
                                        className: fr.cx("fr-m-1v", "fr-my-2v"),
                                    },
                                })) as unknown as TagsGroupProps["tags"]
                        }
                    />
                )}
                <Autocomplete
                    {...restProps}
                    id={inputId}
                    value={value}
                    onChange={onChange}
                    aria-describedby={hasStateMessage ? messageId : undefined}
                    autoComplete={autoComplete}
                    multiple={multiple}
                    filterSelectedOptions={multiple}
                    disablePortal={disablePortal}
                    filterOptions={filterOptions ?? createFilterOptions({ ...defaultSearchFilter, ...searchFilter })}
                    options={options}
                    getOptionLabel={resolveOptionLabel as never}
                    renderInput={(params) => <TextField {...params} inputRef={ref} variant={"filled"} size={"small"} error={state === "error"} />}
                    renderValue={resolvedRenderValue}
                    popupIcon={popupIcon}
                    clearIcon={clearIcon}
                    forcePopupIcon={forcePopupIcon}
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
                            ["& .MuiAutocomplete-option"]: {
                                padding: "8px 16px !important",
                            },
                        }),
                        popupIndicator: css({
                            transform: "none",
                        }),
                        ...classes,
                    }}
                />

                {hasStateMessage && (
                    <p id={messageId} className={fr.cx(state === "error" ? "fr-error-text" : "fr-valid-text")}>
                        {stateRelatedMessage}
                    </p>
                )}
            </div>
        </MuiDsfrThemeProvider>
    );
}

type AutocompleteSelectComponent = <T, M extends boolean | undefined = true, D extends boolean | undefined = false, F extends boolean | undefined = false>(
    props: AutocompleteSelectProps<T, M, D, F> & RefAttributes<HTMLInputElement>
) => ReactElement | null;

const AutocompleteSelectForwardRef = forwardRef(AutocompleteSelectInner);

AutocompleteSelectForwardRef.displayName = symToStr({ AutocompleteSelectInner });

const AutocompleteSelect = AutocompleteSelectForwardRef as AutocompleteSelectComponent;

export default AutocompleteSelect;
