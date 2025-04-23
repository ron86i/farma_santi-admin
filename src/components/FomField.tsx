type FormFieldProps = {
    label: string;
    children: React.ReactNode;
    error?: string;
};

export function FormField({ label, children, error }: FormFieldProps) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                {label}
            </label>
            {children}
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}
