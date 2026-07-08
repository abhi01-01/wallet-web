import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardProps = {
    children: ReactNode;
    className?: string;
};

export function Card({ children, className }: CardProps) {
    return (
        <section
            className={cn(
                "rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20",
                className
            )}
        >
            {children}
        </section>
    );
}