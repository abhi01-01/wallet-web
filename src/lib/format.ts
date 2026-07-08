export function formatMoney(amount: number, assetCode: string) {
    if (assetCode === "INR") {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    }

    return `${amount.toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    })} ${assetCode}`;
}

export function formatDateTime(value: string | null | undefined) {
    if (!value) {
        return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}