import { apiClient } from "@/lib/api-client";
import type {
    KafkaAuditEventDetail,
    KafkaAuditEventListItem,
    MessagingSummaryResponse,
    OutboxEventDetail,
    OutboxEventListItem,
    PagedResponse,
} from "./types";

export async function getMessagingSummary() {
    const response = await apiClient.get<MessagingSummaryResponse>(
        "/api/v1/admin/messaging/summary"
    );

    return response.data;
}

export async function getOutboxEvents(params?: {
    page?: number;
    size?: number;
    status?: string;
}) {
    const response = await apiClient.get<PagedResponse<OutboxEventListItem>>(
        "/api/v1/admin/messaging/outbox-events",
        { params }
    );

    return response.data;
}

export async function getOutboxEventById(eventId: string) {
    const response = await apiClient.get<OutboxEventDetail>(
        `/api/v1/admin/messaging/outbox-events/${eventId}`
    );

    return response.data;
}

export async function getKafkaAuditEvents(params?: {
    page?: number;
    size?: number;
    eventType?: string;
    aggregateType?: string;
    aggregateId?: string;
}) {
    const response = await apiClient.get<PagedResponse<KafkaAuditEventListItem>>(
        "/api/v1/admin/messaging/kafka-audit-events",
        { params }
    );

    return response.data;
}

export async function getKafkaAuditEventById(eventId: string) {
    const response = await apiClient.get<KafkaAuditEventDetail>(
        `/api/v1/admin/messaging/kafka-audit-events/${eventId}`
    );

    return response.data;
}