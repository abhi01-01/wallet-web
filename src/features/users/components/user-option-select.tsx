"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserOptions } from "@/features/users/api";
import type { UserOption } from "@/features/users/types";

type UserOptionSelectProps = {
    value: string;
    onChange: (user: UserOption | null) => void;
    disabled?: boolean;
    label?: string;
};

export function UserOptionSelect({
                                     value,
                                     onChange,
                                     disabled = false,
                                     label = "Target user",
                                 }: UserOptionSelectProps) {
    const usersQuery = useQuery({
        queryKey: ["user-options"],
        queryFn: () => getUserOptions(),
        enabled: !disabled,
    });

    return (
        <div>
            <label className="text-sm font-medium text-zinc-300">{label}</label>

            <select
                value={value}
                disabled={disabled || usersQuery.isLoading || usersQuery.isError}
                onChange={(event) => {
                    const selectedUser =
                        usersQuery.data?.find(
                            (user) => user.userId === event.target.value
                        ) ?? null;

                    onChange(selectedUser);
                }}
                className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <option value="">
                    {usersQuery.isLoading
                        ? "Loading users..."
                        : usersQuery.isError
                            ? "Failed to load users"
                            : "Select user"}
                </option>

                {usersQuery.data?.map((user) => (
                    <option key={user.userId} value={user.userId}>
                        {user.ldap}
                    </option>
                ))}
            </select>

        </div>
    );
}