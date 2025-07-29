// components/CustomToast.tsx
import { CheckCircle, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CustomToastProps {
    t: string | number;
    type: "success" | "error";
    title?: string;
    message: string;
    date?: string;
}

export const CustomToast = ({ t, type, title, message, date }: CustomToastProps) => {
    const styles = {
        success: {
            bg: "bg-green-100 dark:bg-green-900",
            border: "border-green-200 dark:border-green-700",
            icon: <CheckCircle className="mt-1 text-green-500 dark:text-green-300" />,
            text: "text-green-800 dark:text-green-100",
            desc: "text-green-700 dark:text-green-300",
            close: "text-green-500 hover:text-green-700 dark:hover:text-green-200",
        },
        error: {
            bg: "bg-red-100 dark:bg-red-900",
            border: "border-red-200 dark:border-red-700",
            icon: <AlertTriangle className="mt-1 text-red-500 dark:text-red-300" />,
            text: "text-red-800 dark:text-red-100",
            desc: "text-red-700 dark:text-red-300",
            close: "text-red-500 hover:text-red-700 dark:hover:text-red-200",
        },
    }[type];

    return (
        <div className={`flex items-start gap-4 p-4 rounded-md ${styles.bg} ${styles.text} ${styles.border} border shadow-sm w-full max-w-sm`}>
            {styles.icon}
            <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className={`text-sm ${styles.desc}`}>{message}</p>
                {date && <p className="text-xs text-muted-foreground mt-1">{date}</p>}
            </div>
            <button onClick={() => toast.dismiss(t)} className={styles.close}>
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};
