"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageLoading() {
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleStart = () => {
            setLoading(true);
        };

        const handleComplete = () => {
            setLoading(false);
        };

        // Simulate navigation loading
        handleStart();
        const timer = setTimeout(() => {
            handleComplete();
        }, 300);

        return () => {
            clearTimeout(timer);
            handleComplete();
        };
    }, [pathname, searchParams]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                {/* Loading Spinner */}
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                </div>
                
                {/* Loading Text */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Đang tải...</h3>
                    <p className="text-sm text-gray-600">Vui lòng đợi trong giây lát</p>
                </div>

                {/* Progress Bar */}
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
