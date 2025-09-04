import { fr } from "@codegouvfr/react-dsfr";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { ConfigProvider } from "antd";
import { FC, PropsWithChildren } from "react";

const DsfrAntdConfig: FC<PropsWithChildren> = ({ children }) => {
    const { isDark } = useIsDark();

    const { decisions, options } = fr.colors.getHex({ isDark });

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: options.blueFrance.sun113_625.default,
                    colorPrimaryHover: options.blueFrance.sun113_625.hover,
                    colorPrimaryActive: options.blueCumulus.sun368moon732.active,

                    colorSuccess: options.success._950_100.default,
                    colorSuccessHover: options.success._950_100.hover,
                    colorSuccessActive: options.success._950_100.active,

                    colorError: options.error._950_100.default,
                    colorErrorHover: options.error._950_100.hover,
                    colorErrorActive: options.error._950_100.active,

                    colorWarning: options.warning._950_100.default,
                    colorWarningHover: options.warning._950_100.hover,
                    colorWarningActive: options.warning._950_100.active,

                    colorInfo: options.info._950_100.default,
                    colorInfoHover: options.info._950_100.hover,
                    colorInfoActive: options.info._950_100.active,

                    colorBgBase: decisions.background.default.grey.default,
                    colorBorder: decisions.border.default.grey.default,
                    colorText: decisions.text.default.grey.default,
                    colorTextDisabled: decisions.text.disabled.grey.default,
                    colorTextLabel: decisions.text.label.grey.default,

                    borderRadius: 0,
                    colorBorderBg: decisions.border.plain.grey.default,

                    fontFamily: "Marianne, arial, sans-serif",
                    fontSize: 16,

                    fontSizeHeading1: 40,
                    lineHeightHeading1: 48 / 40,

                    fontSizeHeading2: 32,
                    lineHeightHeading2: 40 / 32,

                    fontSizeHeading3: 28,
                    lineHeightHeading3: 36 / 28,

                    fontSizeHeading4: 24,
                    lineHeightHeading4: 32 / 24,

                    fontSizeHeading5: 22,
                    lineHeightHeading5: 28 / 22,

                    // margin: fr.spacing("10v")
                    padding: 16,
                },
                components: {
                    Button: {
                        defaultShadow: "none",
                        primaryShadow: "none",
                        padding: 16,
                        paddingBlock: 16,
                        paddingInline: 16,
                    },
                    // Input: {
                    //     padding: 16,
                    //     paddingBlock: 8,
                    //     paddingInline: 16,
                    //     colorBgContainer: decisions.background.contrast.grey.default,
                    //     // colorBorder: decisions.border.plain.grey.default,
                    //     // borderRadius: 5,
                    // },
                    // InputNumber: {
                    //     padding: 16,
                    //     paddingBlock: 8,
                    //     paddingInline: 16,
                    //     colorBgContainer: decisions.background.contrast.grey.default,
                    // },
                },
            }}
        >
            {children}
        </ConfigProvider>
    );
};

export default DsfrAntdConfig;
