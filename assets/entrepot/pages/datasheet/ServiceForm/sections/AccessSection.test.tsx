// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { FormProvider, useForm, type UseFormReturn } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { type ServiceAccess, serviceFormDefaultValues, type ServiceFormValues } from "../serviceFormSchema";
import AccessSection from "./AccessSection";

vi.mock("@/i18n", async (importOriginal) => ({ ...(await importOriginal<object>()), useTranslation: () => ({ t: (key: string) => key }) }));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// « libre » coché, puis endpoints relus (type, donnée ou relecture) : seuls ceux de `next` restent disponibles
const accessAfter = async (savedAccess: ServiceAccess | undefined, next: readonly ServiceAccess[], error?: string) => {
    let form: UseFormReturn<ServiceFormValues> | undefined;
    function Harness({ availableAccesses }: { availableAccesses: readonly ServiceAccess[] }) {
        form = useForm<ServiceFormValues>({ defaultValues: { ...serviceFormDefaultValues, access: savedAccess } as ServiceFormValues });
        return (
            <FormProvider {...form}>
                <AccessSection availableAccesses={availableAccesses} />
            </FormProvider>
        );
    }
    const root = createRoot(document.createElement("div"));
    await act(async () => root.render(<Harness availableAccesses={["public", "restricted_visible", "restricted"]} />));
    await act(async () => form?.setValue("access", "public"));
    // refus de l’enregistrement posé avant la relecture des endpoints
    if (error) await act(async () => form?.setError("access", { message: error }));
    await act(async () => root.render(<Harness availableAccesses={next} />));
    const result = { access: form?.getValues("access"), error: form?.formState.errors.access?.message };
    act(() => root.unmount());
    return result;
};

describe("AccessSection", () => {
    it("décoche un accès devenu indisponible", async () => {
        expect((await accessAfter(undefined, ["restricted_visible", "restricted"])).access).not.toBe("public");
    });

    it("garde un accès toujours disponible", async () => {
        expect((await accessAfter(undefined, ["public"])).access).toBe("public");
    });

    it("revient à l’accès enregistré en modification", async () => {
        expect((await accessAfter("restricted", ["restricted_visible", "restricted"])).access).toBe("restricted");
    });

    it("garde le message d’un enregistrement refusé", async () => {
        expect(await accessAfter("restricted", ["restricted_visible", "restricted"], "refusé")).toEqual({ access: "restricted", error: "refusé" });
    });
});
