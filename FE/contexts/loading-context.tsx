"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface LoadingContextType {
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);
    const [routeChangeLoading, setRouteChangeLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Handle route changes with optimized timing and debouncing
    useEffect(() => {
        // Don't show route loading if manual loading is already active
        if (isLoading) return;
        
        setRouteChangeLoading(true);
        
        // Very quick timeout to show loading only for slow navigations
        const timer = setTimeout(() => {
            setRouteChangeLoading(false);
        }, 100); // Even faster - 100ms

        return () => {
            clearTimeout(timer);
        };
    }, [pathname, searchParams, isLoading]);

    const combinedLoading = isLoading || routeChangeLoading;

    const setLoading = (loading: boolean) => {
        setIsLoading(loading);
        // Clear route change loading when manual loading is set
        if (loading) {
            setRouteChangeLoading(false);
        }
    };

    return (
        <LoadingContext.Provider value={{ isLoading: combinedLoading, setLoading }}>
            {children}
            {combinedLoading && <LoadingOverlay />}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider");
    }
    return context;
}

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-80 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                {/* Simplified Loading Animation */}
                <div className="relative">
                    {/* Main spinner */}
                    <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Đang tải...
                    </h3>
                </div>
            </div>
        </div>
    );
}
