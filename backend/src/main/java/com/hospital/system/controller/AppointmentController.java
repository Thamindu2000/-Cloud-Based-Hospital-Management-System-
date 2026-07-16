package com.hospital.system.controller;

import com.hospital.system.model.Appointment;
import com.hospital.system.service.AppointmentService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import com.fasterxml.jackson.annotation.JsonFormat;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("/book")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<?> bookAppointment(@Valid @RequestBody BookAppointmentRequest request) {
        try {
            Appointment appointment = appointmentService.bookAppointment(
                    request.getPatientId(),
                    request.getDoctorId(),
                    request.getAppointmentDate()
            );
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'ADMIN')")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getAppointmentsForDoctor(doctorId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    public ResponseEntity<?> updateAppointmentStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        try {
            Appointment appointment = appointmentService.updateAppointmentStatus(id, request.getStatus());
            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Helper requests & responses
    @Data
    public static class BookAppointmentRequest {
        @NotNull(message = "Patient ID is required")
        private Long patientId;

        @NotNull(message = "Doctor ID is required")
        private Long doctorId;

        @NotNull(message = "Appointment date is required")
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime appointmentDate;
    }

    @Data
    public static class StatusUpdateRequest {
        @NotBlank(message = "Status is required")
        private String status;
    }

    @Data
    public static class MessageResponse {
        private final String message;
    }
}
