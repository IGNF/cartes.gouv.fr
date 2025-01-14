import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ReportFormType } from "../../../../@types/app_espaceco";
import {
    CommunityResponseDTO,
    EmailPlannerDTO,
    ReportStatusesType,
    SharedGeoremOptions,
    SharedThemesDTO,
    TableResponseDTO,
    UserSharedThemesDTO,
} from "../../../../@types/espaceco";
import LoadingText from "../../../../components/Utils/LoadingText";
import statuses from "../../../../data/report_statuses.json";
import { useTranslation } from "../../../../i18n/i18n";
import RQKeys from "../../../../modules/espaceco/RQKeys";
import { CartesApiException } from "../../../../modules/jsonFetch";
import api from "../../../api";
import Answers from "./reports/Answers";
import EmailPlanners from "./reports/EmailPlanners";
import Permissions from "./reports/Permissions";
import ReportStatuses from "./reports/ReportStatuses";
import type { UserSharedThemesType } from "./reports/SetSharedThemesDialog";
import SharedThemes from "./reports/SharedThemes";
import ThemeList from "./reports/ThemeList";
import { countActiveStatus, getDefaultStatuses, getMinAuthorizedStatus } from "./reports/Utils";

type ReportsProps = {
    community: CommunityResponseDTO;
};

const minStatuses = getMinAuthorizedStatus();

const Reports: FC<ReportsProps> = ({ community }) => {
    const { t: tCommon } = useTranslation("Common");
    const { t: tStatus } = useTranslation("ReportStatuses");
    const { t } = useTranslation("Reports");

    const schema: yup.ObjectSchema<ReportFormType> = yup.object({
        attributes: yup
            .array()
            .of(
                yup.object({
                    theme: yup.string().required(),
                    database: yup.string(),
                    table: yup.string(),
                    attributes: yup
                        .array()
                        .of(
                            yup.object({
                                name: yup.string().required(),
                                type: yup.string().required(),
                                default: yup.string().nullable(),
                                mandatory: yup.boolean(),
                                multiple: yup.boolean(),
                                values: yup
                                    .array()
                                    .test({
                                        name: "check-values",
                                        test: (list) => {
                                            if (!list) return true;
                                            for (const element of list) {
                                                if (element !== null && typeof element !== "string") return false;
                                            }
                                            return true;
                                        },
                                    })
                                    .nullable(),
                                help: yup.string().nullable(),
                                title: yup.string(),
                                input_constraints: yup
                                    .object({
                                        minLength: yup.number(),
                                        minValue: yup.string(),
                                        maxValue: yup.string(),
                                        pattern: yup.string(),
                                    })
                                    .nullable(),
                                json_schema: yup.object().nullable(),
                                required: yup.boolean(),
                                condition_field: yup.string(),
                            })
                        )
                        .required(),
                })
            )
            .required(),
        report_statuses: yup.lazy(() => {
            const rs = {};
            Object.keys(statuses).forEach((status) => {
                const s = status as ReportStatusesType;
                rs[s] = yup.object({
                    title: yup.string().required(),
                    description: yup.string().nullable(),
                    active: yup.boolean().required(),
                });
            });
            return yup
                .object()
                .shape(rs)
                .test("minStatuses", tStatus("min_statuses"), (statuses) => {
                    if (!statuses) return false;
                    const c = countActiveStatus(statuses);
                    return c >= minStatuses;
                })
                .required();
        }),
        email_planners: yup.array().of(
            yup.object({
                id: yup.number().required(),
                subject: yup.string().required(),
                body: yup.string().required(),
                delay: yup.number().required(),
                repeat: yup.boolean().required(),
                recipients: yup.array().of(yup.string().required()).required(),
                event: yup.string().oneOf(["georem_created", "georem_status_changed"]).required(),
                cancel_event: yup.string().oneOf(["none", "georem_status_changed"]).required(),
                condition: yup.object({
                    status: yup.array().of(yup.string().required()).required(),
                }),
                themes: yup.array().of(yup.string().required()).required(),
            })
        ),
        shared_themes: yup.array().of(
            yup.object({
                community_id: yup.number().required(),
                community_name: yup.string().required(),
                themes: yup.array().of(yup.string().required()).required(),
            })
        ),
        shared_georem: yup.string().oneOf(SharedGeoremOptions).required(),
        all_members_can_valid: yup.boolean().required(),
    });

    // Tables
    const tablesQuery = useQuery<Partial<TableResponseDTO>[], CartesApiException>({
        queryKey: RQKeys.tables(community.id),
        queryFn: ({ signal }) => api.permission.getThemableTables(community.id, signal),
        staleTime: 60000,
    });

    // Themes partagés
    const sharedThemesQuery = useQuery<UserSharedThemesDTO[], CartesApiException>({
        queryKey: RQKeys.userSharedThemes(),
        queryFn: () => api.user.getSharedThemes(),
        staleTime: 3600000,
    });

    // Email planners
    const emailPlannersQuery = useQuery<EmailPlannerDTO[], CartesApiException>({
        queryKey: RQKeys.emailPlanners(community.id),
        queryFn: () => api.emailplanner.getAll(community.id),
        staleTime: 3600000,
    });

    // Filtrage des themes partages qui sont déjà dans la communauté
    const userSharedThemes = useMemo<UserSharedThemesType>(() => {
        if (sharedThemesQuery.data) {
            const communities = sharedThemesQuery.data.filter((sht) => {
                return sht.community_id !== community.id;
            });
            const ret: UserSharedThemesType = {};
            communities.forEach((comm) => {
                const themes = Array.from(comm.themes, (t) => t.theme);
                ret[comm.community_id] = { communityName: comm.community_name, themes: themes };
            });
            return ret;
        }
        return {};
    }, [community, sharedThemesQuery.data]);

    /**
     * On regarde la conformité entre les thèmes partagés de l'utilisateur et les thèmes
     * partagés de la communauté
     */
    const sharedThemes = useMemo(() => {
        const shared = community.shared_themes ?? [];

        const ret: SharedThemesDTO[] = [];
        if (userSharedThemes) {
            shared
                .filter((s) => s.community_id in userSharedThemes)
                .forEach((s) => {
                    const themes = s.themes.filter((theme) => userSharedThemes[s.community_id].themes.indexOf(theme) >= 0);
                    if (themes.length) {
                        ret.push({ ...s, themes: themes });
                    }
                });
        }
        return ret;
    }, [community, userSharedThemes]);

    const form = useForm<ReportFormType>({
        resolver: yupResolver(schema),
        mode: "onChange",
        values: {
            attributes: community.attributes ?? [],
            report_statuses: community.report_statuses ?? getDefaultStatuses(),
            email_planners: emailPlannersQuery.data ?? [],
            shared_themes: sharedThemes,
            shared_georem: community.shared_georem,
            all_members_can_valid: community.all_members_can_valid,
        },
    });

    const {
        handleSubmit,
        getValues: getFormValues,
        formState: { errors },
    } = form;

    const onSubmit = () => {
        console.log(getFormValues());
    };

    return (
        <div>
            {tablesQuery.isError && <Alert severity="error" closable title={tablesQuery.error.message} />}
            {sharedThemesQuery.isError && <Alert severity="error" closable title={sharedThemesQuery.error.message} />}
            {emailPlannersQuery.isError && <Alert severity="error" closable title={emailPlannersQuery.error.message} />}
            {tablesQuery.isLoading && <LoadingText as="h6" message={t("loading_tables")} />}
            {sharedThemesQuery.isLoading && <LoadingText as="h6" message={t("loading_shared_themes")} />}
            {emailPlannersQuery.isLoading && <LoadingText as="h6" message={t("loading_email_planners")} />}
            {tablesQuery.data && sharedThemesQuery.data && emailPlannersQuery.data && (
                <div>
                    <ThemeList form={form} tables={tablesQuery.data ?? []} state={errors.attributes ? "error" : "default"} />
                    <SharedThemes form={form} userSharedThemes={userSharedThemes} />
                    <ReportStatuses form={form} state={errors.report_statuses ? "error" : "default"} />
                    <EmailPlanners communityId={community.id} form={form} emailPlanners={emailPlannersQuery.data} />
                    <Permissions form={form} />
                    <Answers form={form} />
                    <div className={fr.cx("fr-grid-row", "fr-grid-row--right", "fr-mt-2v")}>
                        <Button
                            onClick={() => {
                                handleSubmit(onSubmit)();
                            }}
                        >
                            {tCommon("record")}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
