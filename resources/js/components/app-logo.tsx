// resources/js/components/app-logo.tsx

import React from 'react';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <img 
                src="/Logo-Circular.png" 
                alt="UGEL Ambo" 
                className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-sm font-bold text-neutral-800 dark:text-white tracking-wide">
                Conformidad de Internet
            </span>
        </div>
    );
}