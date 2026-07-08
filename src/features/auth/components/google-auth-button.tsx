"use client";

import {
    CredentialResponse,
    GsiButtonConfiguration,
    useGoogleOAuth,
} from "@react-oauth/google";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/features/auth/auth-provider";
import { resolveErrorMessage } from "@/lib/errors";

type GoogleAuthButtonProps = {
    label?: string;
};

type GoogleAccounts = {
    accounts?: {
        id?: {
            initialize: (configuration: {
                client_id: string;
                callback: (credentialResponse: CredentialResponse) => void;
            }) => void;
            renderButton: (
                parent: HTMLElement,
                options: GsiButtonConfiguration
            ) => void;
        };
    };
};

declare global {
    interface Window {
        google?: GoogleAccounts;
        walletGoogleCredentialHandler?: (response: CredentialResponse) => void;
        walletGoogleInitializedClientId?: string;
    }
}

export function GoogleAuthButton({
                                     label = "Continue with Google",
                                 }: GoogleAuthButtonProps) {
    const { googleLogin } = useAuth();
    const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
    const buttonContainerRef = useRef<HTMLDivElement | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleCredential = useCallback(
        async (credentialResponse: CredentialResponse) => {
            setErrorMessage(null);

            if (!credentialResponse.credential) {
                setErrorMessage("Google did not return an ID token.");
                return;
            }

            try {
                await googleLogin({
                    idToken: credentialResponse.credential,
                });
            } catch (error) {
                setErrorMessage(
                    resolveErrorMessage(error, {
                        fallback: "Google login failed.",
                        responseFallback: "Google login failed. Check backend response.",
                    })
                );
            }
        },
        [googleLogin]
    );

    useEffect(() => {
        window.walletGoogleCredentialHandler = handleCredential;

        return () => {
            if (window.walletGoogleCredentialHandler === handleCredential) {
                window.walletGoogleCredentialHandler = undefined;
            }
        };
    }, [handleCredential]);

    useEffect(() => {
        const buttonContainer = buttonContainerRef.current;
        const googleAccountsId = window.google?.accounts?.id;

        if (!scriptLoadedSuccessfully || !buttonContainer || !googleAccountsId) {
            return;
        }

        if (window.walletGoogleInitializedClientId !== clientId) {
            googleAccountsId.initialize({
                client_id: clientId,
                callback: (credentialResponse) => {
                    window.walletGoogleCredentialHandler?.(credentialResponse);
                },
            });
            window.walletGoogleInitializedClientId = clientId;
        }

        buttonContainer.replaceChildren();
        googleAccountsId.renderButton(buttonContainer, {
            text: "continue_with",
            size: "large",
            theme: "outline",
        });
    }, [clientId, scriptLoadedSuccessfully]);

    return (
        <div>
            <div className="flex justify-center">
                <div ref={buttonContainerRef} />
            </div>

            {errorMessage ? (
                <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                </div>
            ) : null}

            <p className="mt-3 text-center text-xs text-zinc-500">{label}</p>
        </div>
    );
}
