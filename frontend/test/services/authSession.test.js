import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import {
    clearAuthSession,
    getAccessToken,
    getAuthSession,
    setAuthSession,
    subscribeAuthSession,
    updateAuthSessionUser,
} from "../../src/services/authSession";

describe("authSession", () => {
    beforeEach(() => {
        clearAuthSession();
    });

    it("cria, consulta e atualiza uma sessão", () => {
        const session = setAuthSession({
            accessToken: "token",
            expiresIn: 3600,
            usuario: { idUsuario: 1, nome: "A", email: "a@x", perfil: "Caixa" },
        });
        expect(getAuthSession()).toEqual(session);
        expect(getAccessToken()).toBe("token");
        expect(updateAuthSessionUser({
            idUsuario: 1, nome: "B", email: "b@x", perfil: "Gestor",
        }).usuario.nome).toBe("B");
        expect(updateAuthSessionUser({ idUsuario: 2 })).toBeNull();
    });

    it("notifica assinantes e encerra sessões expiradas", () => {
        const callback = jest.fn();
        const unsubscribe = subscribeAuthSession(callback);
        setAuthSession({
            accessToken: "token",
            expiresIn: -1,
            usuario: { idUsuario: 1, nome: "A", email: "a@x", perfil: "Caixa" },
        });
        expect(getAuthSession()).toBeNull();
        unsubscribe();
        clearAuthSession();
        expect(callback).toHaveBeenCalled();
    });
});
