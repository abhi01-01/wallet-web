import { ReactNode } from "react";
import { Card } from "./card";

type MetricCardProps = {
    label: string;
    value: string | number;
    description?: string;
    icon?: ReactNode;
};

export function MetricCard({
                               label,
                               value,
                               description,
                               icon,
                           }: MetricCardProps) {
    return (
        <Card>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-zinc-500">{label}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        {value}
                    </p>
                    {description ? (
                        <p className="mt-2 text-sm text-zinc-500">{description}</p>
                    ) : null}
                </div>
                {icon ? <div className="text-zinc-400">{icon}</div> : null}
            </div>
        </Card>
    );
}