package com.batutinhas.restaurante_pop.config;

import com.batutinhas.restaurante_pop.dto.ApiErrorDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    public ResponseEntity<ApiErrorDTO> handleInvalidRequest(RuntimeException exception) {
        return ResponseEntity.badRequest()
                .body(new ApiErrorDTO("BAD_REQUEST", "Os dados enviados são inválidos."));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorDTO> handleNotFound(EntityNotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiErrorDTO("NOT_FOUND", "O recurso solicitado não foi encontrado."));
    }
}
