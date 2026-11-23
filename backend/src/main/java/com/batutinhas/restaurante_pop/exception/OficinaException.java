package com.batutinhas.restaurante_pop.exception;

import com.batutinhas.restaurante_pop.dto.OficinaDTO;
import org.springframework.http.HttpStatus;

public class OficinaException extends RuntimeException {
    private final HttpStatus status;
    private final String code;
    private final OficinaDTO.ConfirmacaoReagendamento confirmacao;

    public OficinaException(HttpStatus status, String code, String mensagem) {
        super(mensagem);
        this.status = status;
        this.code = code;
        this.confirmacao = null;
    }

    public OficinaException(int quantidade, String referencia) {
        super("Confira as inscrições afetadas e confirme o reagendamento.");
        this.status = HttpStatus.CONFLICT;
        this.code = "REAGENDAMENTO_REQUER_CONFIRMACAO";
        this.confirmacao = new OficinaDTO.ConfirmacaoReagendamento(code, getMessage(), quantidade, referencia);
    }

    public HttpStatus getStatus() { return status; }
    public String getCode() { return code; }
    public OficinaDTO.ConfirmacaoReagendamento getConfirmacao() { return confirmacao; }
}
