"use client";

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type SidebarContextValue = {
    isCollapsed: boolean;
    toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = useCallback(() => {
        setIsCollapsed((currentValue) => !currentValue);
    }, []);

    const value = useMemo(
        () => ({
            isCollapsed,
            toggleSidebar,
        }),
        [isCollapsed, toggleSidebar]
    );

    return (
        <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);

    if (!context) {
        throw new Error("useSidebar must be used inside SidebarProvider");
    }

    return context;
}
