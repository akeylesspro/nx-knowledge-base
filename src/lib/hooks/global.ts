import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const useTranslationHelpers = () => {
    const { t } = useTranslation();
    const translationsFunctions = useMemo(
        () => ({
            getLengthError: (entity: string, length: number) => t("length_error").replace("{entity}", entity).replace("{length}", length.toString()),
            getSelectEntity: (entity: string) => t("select_entity").replace("{entity}", entity),
            getServerError: (action: string) => t("server_error").replace("{action}", action),
            getDeleteEntity: (entity: string) => t("delete_entity").replace("{entity}", entity),
            getEditEntity: (entity: string) => t("edit_entity").replace("{entity}", entity),
            getAddEntity: (entity: string) => t("add_entity").replace("{entity}", entity),
            getCreateEntity: (entity: string) => t("create_entity").replace("{entity}", entity),
            getActionEntity: (entity: string) => t("action_entity").replace("{entity}", entity),
            getNotFoundEntity: (entity: string) => t("entity_not_found").replace("{entity}", entity),
        }),
        [t]
    );

    return translationsFunctions;
};

type UseFetchDataOptions = {
    initialLoading?: boolean;
};

export const useFetchData = (options: UseFetchDataOptions = {}) => {
    const { initialLoading = false } = options;
    const [isLoading, setIsLoading] = useState(initialLoading);
    const pendingCountRef = useRef(0);
    const fetchData = async <T = any>(callback: () => Promise<T>) => {
        pendingCountRef.current += 1;
        setIsLoading(true);
        window.document.body.style.cursor = "wait";

        try {
            return await callback();
        } finally {
            pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
            if (pendingCountRef.current === 0) {
                window.document.body.style.cursor = "default";
                setIsLoading(false);
            }
        }
    };

    return { fetchData, isLoading };
};
