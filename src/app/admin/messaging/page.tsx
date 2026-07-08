"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, CheckCircle2, RadioTower, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/ui/metric-card";
import { Card } from "@/components/ui/card";
import { getMessagingSummary } from "@/features/messaging/api";

export default function MessagingDashboardPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["messaging-summary"],
        queryFn: getMessagingSummary,
        refetchInterval: 10_000,
    });

    return (
        <AppShell allowedRoles={["SYSTEM"]}>
            <div>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                    Kafka Observability
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                    Messaging Control Plane
                </h2>
                <p className="mt-4 max-w-3xl text-zinc-400">
                    Track transactional outbox events, Kafka publishing state, and audit
                    consumer progress.
                </p>
            </div>

            {isLoading ? (
                <div className="mt-8 text-sm text-zinc-500">Loading messaging data...</div>
            ) : null}

            {error ? (
                <Card className="mt-8 border-red-500/30 bg-red-500/10">
                    <p className="text-sm font-medium text-red-300">
                        Failed to load messaging summary.
                    </p>
                    <p className="mt-2 text-sm text-red-200/70">
                        Check gateway URL, token, and wallet-service availability.
                    </p>
                </Card>
            ) : null}

            {data ? (
                <>
                    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <MetricCard
                            label="Outbox Events"
                            value={data.outbox.total}
                            description="Total events stored in transactional outbox"
                            icon={<Activity className="h-5 w-5" />}
                        />

                        <MetricCard
                            label="Published"
                            value={data.outbox.countsByStatus.PUBLISHED ?? 0}
                            description="Events successfully published to Kafka"
                            icon={<CheckCircle2 className="h-5 w-5" />}
                        />

                        <MetricCard
                            label="Failed / Dead"
                            value={`${data.outbox.countsByStatus.FAILED ?? 0} / ${
                                data.outbox.countsByStatus.DEAD ?? 0
                            }`}
                            description="Events requiring retry or manual attention"
                            icon={<TriangleAlert className="h-5 w-5" />}
                        />

                        <MetricCard
                            label="Kafka Audit"
                            value={data.kafkaAudit.totalConsumed}
                            description="Events consumed and stored by audit consumer"
                            icon={<RadioTower className="h-5 w-5" />}
                        />
                    </div>

                    <div className="mt-6 grid gap-4 xl:grid-cols-2">
                        <Card>
                            <p className="text-sm text-zinc-500">Latest Outbox Event</p>
                            {data.outbox.latestEvent ? (
                                <div className="mt-4 space-y-2 text-sm">
                                    <p>
                                        <span className="text-zinc-500">Event:</span>{" "}
                                        {data.outbox.latestEvent.eventType}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Status:</span>{" "}
                                        {data.outbox.latestEvent.status}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Topic:</span>{" "}
                                        {data.outbox.latestEvent.topic}
                                    </p>
                                    <p className="break-all">
                                        <span className="text-zinc-500">Event ID:</span>{" "}
                                        {data.outbox.latestEvent.eventId}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-zinc-500">No outbox events.</p>
                            )}
                        </Card>

                        <Card>
                            <p className="text-sm text-zinc-500">Latest Kafka Audit Event</p>
                            {data.kafkaAudit.latestEvent ? (
                                <div className="mt-4 space-y-2 text-sm">
                                    <p>
                                        <span className="text-zinc-500">Event:</span>{" "}
                                        {data.kafkaAudit.latestEvent.eventType}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Topic:</span>{" "}
                                        {data.kafkaAudit.latestEvent.topic}
                                    </p>
                                    <p>
                                        <span className="text-zinc-500">Partition / Offset:</span>{" "}
                                        {data.kafkaAudit.latestEvent.partitionId} /{" "}
                                        {data.kafkaAudit.latestEvent.eventOffset}
                                    </p>
                                    <p className="break-all">
                                        <span className="text-zinc-500">Event ID:</span>{" "}
                                        {data.kafkaAudit.latestEvent.eventId}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-zinc-500">
                                    No Kafka audit events.
                                </p>
                            )}
                        </Card>
                    </div>
                </>
            ) : null}
        </AppShell>
    );
}