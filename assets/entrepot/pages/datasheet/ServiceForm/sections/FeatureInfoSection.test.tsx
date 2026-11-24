// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { serviceFormDefaultValues, type ServiceFormValues } from "../serviceFormSchema";
import FeatureInfoSection from "./FeatureInfoSection";

vi.mock("@/i18n", () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("FeatureInfoSection", () => {
    // à la création, les tables arrivent après coup par setValue : aucune valeur par défaut au chemin de la case
    it("garde un tableau quand la table n’a qu’une colonne à proposer", async () => {
        let form: UseFormReturn<ServiceFormValues> | undefined;
        function Harness() {
            form = useForm<ServiceFormValues>({ defaultValues: { ...serviceFormDefaultValues, featureinfo: { enabled: true, format: "list" } } });
            return (
                <FormProvider {...form}>
                    <FeatureInfoSection columns={{ points: ["nom"] }} />
                </FormProvider>
            );
        }
        const container = document.createElement("div");
        const root = createRoot(container);
        await act(async () => root.render(<Harness />));
        await act(async () =>
            form?.setValue("tables", [
                { native_name: "points", selected: true, title: "points", public_name: "points", description: "", keywords: [], featureinfo_attributes: [] },
            ])
        );

        const checkbox = container.querySelector<HTMLInputElement>('input[type="checkbox"][value="nom"]');
        await act(async () => checkbox?.click());
        expect(form?.getValues("tables.0.featureinfo_attributes")).toEqual(["nom"]);

        await act(async () => checkbox?.click());
        expect(form?.getValues("tables.0.featureinfo_attributes")).toEqual([]);
        act(() => root.unmount());
    });

    it("garde l’ordre des colonnes quel que soit l’ordre des clics", async () => {
        let form: UseFormReturn<ServiceFormValues> | undefined;
        const table = {
            native_name: "points",
            selected: true,
            title: "points",
            public_name: "points",
            description: "",
            keywords: [],
            featureinfo_attributes: ["a", "b"],
        };
        function Harness() {
            form = useForm<ServiceFormValues>({
                defaultValues: { ...serviceFormDefaultValues, tables: [table], featureinfo: { enabled: true, format: "list" } },
            });
            return (
                <FormProvider {...form}>
                    <FeatureInfoSection columns={{ points: ["a", "b"] }} />
                </FormProvider>
            );
        }
        const container = document.createElement("div");
        const root = createRoot(container);
        await act(async () => root.render(<Harness />));

        const a = container.querySelector<HTMLInputElement>('input[type="checkbox"][value="a"]');
        await act(async () => a?.click());
        await act(async () => a?.click());
        expect(form?.getValues("tables.0.featureinfo_attributes")).toEqual(["a", "b"]);
        expect(form?.formState.isDirty).toBe(false);
        act(() => root.unmount());
    });
});
