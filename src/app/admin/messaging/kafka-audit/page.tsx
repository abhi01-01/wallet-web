"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { JsonBlock } from "@/components/ui/json-block";
import { PaginationBar } from "@/components/ui/pagination-bar";
import {
    getKafkaAuditEventById,
    getKafkaAuditEvents,
} from "@/features/messaging/api";

export default function KafkaAuditEventsPage() {
    const [page, setPage] = useState(0);
    const [eventType, setEventType] = useState("");
    const [aggregateType, setAggregateType] = useState("");
    const [aggregateId, setAggregateId] = useState("");
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const eventsQuery = useQuery({
        queryKey: ["kafka-audit-events", page, eventType, aggregateType, aggregateId],
        queryFn: () =>
            getKafkaAuditEvents({
                page,
                size: 10,
                eventType: eventType || undefined,
                aggregateType: aggregateType || undefined,
                aggregateId: aggregateId || undefined,
            }),
    });

    const detailQuery = useQuery({
        queryKey: ["kafka-audit-event-detail", selectedEventId],
        queryFn: () => getKafkaAuditEventById(selectedEventId as string),
        enabled: Boolean(selectedEventId),
    });

    const events = eventsQuery.data;

    return (
        <AppShell allowedRoles={["SYSTEM"]}>
            <div className="flex items-start justify-between gap-6">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                        Kafka Audit
                    </p>
                    <h2 className="mt-3 text-4xl font-semibold tracking-tight">
                        Consumed Events
                    </h2>
                    <p className="mt-4 max-w-3xl text-zinc-400">
                        Inspect Kafka events consumed by the wallet-service audit consumer.
                        This verifies that published outbox events reached Kafka and were
                        consumed safely.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => eventsQuery.refetch()}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_460px]">
                <Card className="overflow-hidden p-0">
                    <div className="border-b border-white/10 px-5 py-4">
                        <p className="font-medium text-white">Kafka audit stream</p>
                        <p className="mt-1 text-sm text-zinc-500">
                            Filter by event type or aggregate identity.
                        </p>

                        <div className="mt-4 grid gap-3 lg:grid-cols-3">
                            <input
                                value={eventType}
                                onChange={(event) => {
                                    setEventType(event.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                                placeholder="eventType"
                            />

                            <input
                                value={aggregateType}
                                onChange={(event) => {
                                    setAggregateType(event.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                                placeholder="aggregateType"
                            />

                            <input
                                value={aggregateId}
                                onChange={(event) => {
                                    setAggregateId(event.target.value);
                                    setPage(0);
                                }}
                                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none"
                                placeholder="aggregateId"
                            />
                        </div>
                    </div>

                    {eventsQuery.isLoading ? (
                        <div className="p-6 text-sm text-zinc-500">
                            Loading Kafka audit events...
                        </div>
                    ) : null}

                    {eventsQuery.isError ? (
                        <div className="p-6 text-sm text-red-300">
                            Failed to load Kafka audit events. Check SYSTEM token and gateway
                            route.
                        </div>
                    ) : null}

                    {events && events.content.length === 0 ? (
                        <div className="p-6 text-sm text-zinc-500">
                            No Kafka audit events found.
                        </div>
                    ) : null}

                    {events && events.content.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[980px] text-left text-sm">
                                    <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-[0.18em] text-zinc-500">
                                    <tr>
                                        <th className="px-5 py-4">Event Type</th>
                                        <th className="px-5 py-4">Aggregate</th>
                                        <th className="px-5 py-4">Topic</th>
                                        <th className="px-5 py-4">Partition</th>
                                        <th className="px-5 py-4">Offset</th>
                                        <th className="px-5 py-4">Consumed</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {events.content.map((event) => (
                                        <tr
                                            key={event.eventId}
                                            onClick={() => setSelectedEventId(event.eventId)}
                                            className="cursor-pointer border-b border-white/10 transition hover:bg-white/[0.04]"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-zinc-200">
                                                    {event.eventType}
                                                </p>
                                                <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                    {event.eventId}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-zinc-300">{event.aggregateType}</p>
                                                <p className="mt-1 max-w-xs truncate text-xs text-zinc-500">
                                                    {event.aggregateId}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-zinc-400">
                                                {event.topic}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-300">
                                                {event.partitionId}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-300">
                                                {event.eventOffset}
                                            </td>
                                            <td className="px-5 py-4 text-zinc-400">
                                                {formatDate(event.consumedAt)}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>

                            <PaginationBar
                                page={events.page}
                                totalPages={events.totalPages}
                                totalElements={events.totalElements}
                                onPageChange={setPage}
                            />
                        </>
                    ) : null}
                </Card>

                <Card>
                    <p className="text-sm font-medium text-white">Audit event details</p>
                    <p className="mt-1 text-sm text-zinc-500">
                        Select a row to inspect consumed payload and headers.
                    </p>

                    {!selectedEventId ? (
                        <div className="mt-8 rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">
                            No event selected.
                        </div>
                    ) : null}

                    {detailQuery.isLoading ? (
                        <div className="mt-8 text-sm text-zinc-500">Loading details...</div>
                    ) : null}

                    {detailQuery.isError ? (
                        <div className="mt-8 text-sm text-red-300">
                            Failed to load audit event detail.
                        </div>
                    ) : null}

                    {detailQuery.data ? (
                        <div className="mt-6 space-y-6">
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-zinc-500">Event ID:</span>{" "}
                                    <span className="break-all text-zinc-300">
                    {detailQuery.data.eventId}
                  </span>
                                </p>
                                <p>
                                    <span className="text-zinc-500">Topic:</span>{" "}
                                    {detailQuery.data.topic}
                                </p>
                                <p>
                                    <span className="text-zinc-500">Partition / Offset:</span>{" "}
                                    {detailQuery.data.partitionId} /{" "}
                                    {detailQuery.data.eventOffset}
                                </p>
                                <p>
                                    <span className="text-zinc-500">Key:</span>{" "}
                                    <span className="break-all">{detailQuery.data.eventKey}</span>
                                </p>
                            </div>

                            <JsonBlock title="Payload" value={detailQuery.data.payload} />
                            <JsonBlock title="Headers" value={detailQuery.data.headers} />
                        </div>
                    ) : null}
                </Card>
            </div>
        </AppShell>
    );
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}