let session = null;

function notify() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth-session-change"));
    }
}

export function setAuthSession({ accessToken, expiresIn, usuario }) {
    session = {
        accessToken,
        expiresAt: Date.now() + Number(expiresIn) * 1000,
        usuario,
    };
    notify();
    return session;
}

export function getAuthSession() {
    if (session && Date.now() >= session.expiresAt) {
        session = null;
        notify();
    }
    return session;
}

export function getAccessToken() {
    if (typeof window === "undefined") return null;
    return getAuthSession()?.accessToken ?? null;
}

export function updateAuthSessionUser(usuario) {
    const current = getAuthSession();
    if (!current || current.usuario.idUsuario !== usuario.idUsuario) return null;

    session = {
        ...current,
        usuario: {
            idUsuario: current.usuario.idUsuario,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
        },
    };
    notify();
    return session;
}

export function clearAuthSession() {
    session = null;
    notify();
}

export function subscribeAuthSession(callback) {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("auth-session-change", callback);
    return () => window.removeEventListener("auth-session-change", callback);
}
