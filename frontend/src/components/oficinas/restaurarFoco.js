export function restaurarFoco(acionador, destinoId) {
    requestAnimationFrame(() => {
        const destino = acionador?.isConnected && !acionador.disabled
            ? acionador : document.getElementById(destinoId);
        destino?.focus();
    });
}
