import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export const useTranslationHelpers = () => {
    const { t } = useTranslation();
    const getLengthError = (entity: string, length: number) => {
        return t("length_error").replace("{entity}", entity).replace("{length}", length.toString());
    };
    const getSelectEntity = (entity: string) => {
        return t("select_entity").replace("{entity}", entity);
    };
    const getServerError = (action: string) => {
        return t("server_error").replace("{action}", action);
    };
    const getDeleteEntity = (entity: string) => {
        return t("delete_entity").replace("{entity}", entity);
    };
    const getEditEntity = (entity: string) => {
        return t("edit_entity").replace("{entity}", entity);
    };
    const getAddEntity = (entity: string) => {
        return t("add_entity").replace("{entity}", entity);
    };
    const getNotFoundEntity = (entity: string) => {
        return t("entity_not_found").replace("{entity}", entity);
    };

    return { getLengthError, getSelectEntity, getServerError, getDeleteEntity, getEditEntity, getAddEntity, getNotFoundEntity };
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
