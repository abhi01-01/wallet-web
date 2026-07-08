export type OutboxStatus =
    | "PENDING"
    | "PUBLISHING"
    | "PUBLISHED"
    | "FAILED"
    | "DEAD";

export type PagedResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
};

export type MessagingSummaryResponse = {
    outbox: {
        total: number;
        countsByStatus: Record<OutboxStatus, number>;
        readyToPublish: number;
        latestEvent: null | {
            id: number;
            eventId: string;
            eventType: string;
            topic: string;
            eventKey: string;
            status: OutboxStatus;
            publishAttempts: number;
            createdAt: string;
            publishedAt: string | null;
            lastError: string | null;
        };
    };
    kafkaAudit: {
        totalConsumed: number;
        walletTransactionPostedConsumed: number;
        latestEvent: null | {
            id: number;
            eventId: string;
            eventType: string;
            topic: string;
            partitionId: number;
            eventOffset: number;
            eventKey: string;
            consumedAt: string;
        };
    };
};

export type OutboxEventListItem = {
    id: number;
    eventId: string;
    aggregateType: string;
    aggregateId: string;
    eventType: string;
    schemaVersion: number;
    topic: string;
    eventKey: string;
    status: OutboxStatus;
    publishAttempts: number;
    nextAttemptAt: string | null;
    createdAt: string;
    publishedAt: string | null;
    lastError: string | null;
};

export type OutboxEventDetail = OutboxEventListItem & {
    payload: Record<string, unknown>;
    headers: Record<string, unknown>;
    lockedBy?: string | null;
    lockedAt?: string | null;
};

export type KafkaAuditEventListItem = {
    id: number;
    eventId: string;
    eventType: string;
    schemaVersion: number;
    source: string;
    aggregateType: string;
    aggregateId: string;
    topic: string;
    partitionId: number;
    eventOffset: number;
    eventKey: string;
    consumedAt: string;
};

export type KafkaAuditEventDetail = KafkaAuditEventListItem & {
    payload: Record<string, unknown>;
    headers: Record<string, unknown>;
};