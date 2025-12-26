import React from 'react';
import { cn } from './Button';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={cn('bg-white overflow-hidden shadow rounded-lg border border-gray-200', className)} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return <div className={cn('px-4 py-5 sm:px-6 border-b border-gray-200', className)} {...props}>{children}</div>;
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return <div className={cn('px-4 py-5 sm:p-6', className)} {...props}>{children}</div>;
};
