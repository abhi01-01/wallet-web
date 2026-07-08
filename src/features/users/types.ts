export type UserOption = {
    userId: string;
    email: string;
    ldap: string;
    ownerType: "USER" | "SYSTEM" | string;
};