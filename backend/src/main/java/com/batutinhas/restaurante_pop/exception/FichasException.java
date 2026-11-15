package com.batutinhas.restaurante_pop.exception;

public class FichasException extends RuntimeException {
    private final String code;

    public FichasException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() { return code; }
}
