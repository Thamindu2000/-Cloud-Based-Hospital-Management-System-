package com.hospital.system.controller;

import com.hospital.system.model.Patient;
import com.hospital.system.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<List<Patient>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PATIENT')")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @Valid @RequestBody PatientUpdateRequest request) {
        try {
            Patient updatedPatient = patientService.updatePatient(
                    id,
                    request.getName(),
                    request.getAge(),
                    request.getBloodGroup(),
                    request.getMedicalHistory()
            );
            return ResponseEntity.ok(updatedPatient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        try {
            patientService.deletePatient(id);
            return ResponseEntity.ok(new MessageResponse("Patient deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Inner DTO helper classes
    @lombok.Data
    public static class PatientUpdateRequest {
        @NotBlank(message = "Name is required")
        private String name;

        @NotNull(message = "Age is required")
        private Integer age;

        private String bloodGroup;
        private String medicalHistory;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
