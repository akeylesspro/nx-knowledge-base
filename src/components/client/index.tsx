"use client";
import { Badge, Loader } from "akeyless-client-commons/components";
import { useTranslation } from "react-i18next";

export const SayHello = () => {
    const { t } = useTranslation();
    return <div> {t("length_error")} </div>;
};

export const AppLoader = () => {
    return (
        <div className="_full _center">
            <Loader size={200} color={"#000"} />
        </div>
    );
};

export const QaBadge = () => {
    return (
        <>
            {process.env.NEXT_PUBLIC_MODE === "qa" && (
                <div className="py-1 px-5 z-30 fixed left-1/2 top-5 transform -translate-x-1/2 -translate-y-1/2 text-xl bg-red-500 rounded-xl">
                    QA environment
                </div>
            )}
        </>
    );
};
