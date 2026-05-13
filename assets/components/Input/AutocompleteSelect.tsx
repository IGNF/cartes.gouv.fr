import { fr } from "@codegouvfr/react-dsfr";
import MuiDsfrThemeProvider from "@codegouvfr/react-dsfr/mui";
import { TagProps } from "@codegouvfr/react-dsfr/Tag";
import TagsGroup, { TagsGroupProps } from "@codegouvfr/react-dsfr/TagsGroup";
import { Autocomplete, AutocompleteProps, CreateFilterOptionsConfig, TextField, createFilterOptions } from "@mui/material";
import { ForwardedRef, ReactElement, ReactNode, RefAttributes, forwardRef, useId } from "react";
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
        autoComplete = true,
        disablePortal = true,
        getOptionLabel,
        classes,
        renderValue,
        filterOptions,
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

    const defaultRenderValue: NonNullable<AutocompleteProps<unknown, true, boolean | undefined, boolean | undefined>["renderValue"]> = (
        selectedValue,
        getItemProps
    ) => {
        return (
            <TagsGroup
                tags={
                    (Array.isArray(selectedValue) ? selectedValue : [selectedValue])
                        .filter((item) => item !== null && item !== undefined)
                        .map((tag, index) => {
                            const { onDelete, className, disabled, tabIndex } = getItemProps({ index });

                            return {
                                children: resolveOptionLabel(tag as OptionLike),
                                dismissible: true,
                                as: "button",
                                nativeButtonProps: {
                                    type: "button",
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

    const resolvedRenderValue = (multiple ? (renderValue ?? (defaultRenderValue as unknown as typeof renderValue)) : renderValue) as
        | AutocompleteSelectBaseProps["renderValue"]
        | undefined;

    return (
        <MuiDsfrThemeProvider>
            <div className={fr.cx("fr-input-group", state === "error" && "fr-input-group--error", state === "success" && "fr-input-group--valid")}>
                <label className={fr.cx("fr-label")} htmlFor={inputId}>
                    {label}
                    {hintText && <span className="fr-hint-text">{hintText}</span>}
                </label>
                <Autocomplete
                    {...restProps}
                    id={inputId}
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
