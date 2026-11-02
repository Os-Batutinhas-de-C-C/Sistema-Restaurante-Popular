package com.batutinhas.restaurante_pop.service;

final class RequestValidation {
    private RequestValidation() {
    }

    static String requiredText(String value, String field, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " é obrigatório.");
        }
        return text(value, field, maxLength);
    }

    static String text(String value, String field, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " excede o limite de " + maxLength + " caracteres.");
        }
        return value;
    }
}
