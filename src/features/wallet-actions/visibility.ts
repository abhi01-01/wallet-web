export function canShowSystemBonusCard(ownerType: string | null | undefined) {
    return normalizeOwnerType(ownerType) === "SYSTEM";
}

function normalizeOwnerType(ownerType: string | null | undefined) {
    return ownerType?.trim().toUpperCase() ?? null;
}
