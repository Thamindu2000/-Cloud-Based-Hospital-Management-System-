package com.hospital.system.controller;

import com.hospital.system.model.Doctor;
import com.hospital.system.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportDoctorsToCsv() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        
        StringBuilder csvContent = new StringBuilder();
        // Header row
        csvContent.append("ID,Full Name,Specialization,Username\n");
        
        // Data rows
        for (Doctor doc : doctors) {
            String id = doc.getId() != null ? String.valueOf(doc.getId()) : "";
            String name = doc.getName() != null ? doc.getName() : "";
            String specialization = doc.getSpecialization() != null ? doc.getSpecialization() : "";
            String username = (doc.getUser() != null && doc.getUser().getUsername() != null) 
                    ? doc.getUser().getUsername() : "";
            
            csvContent.append(escapeCsvField(id)).append(",")
                      .append(escapeCsvField(name)).append(",")
                      .append(escapeCsvField(specialization)).append(",")
                      .append(escapeCsvField(username)).append("\n");
        }
        
        byte[] csvBytes = csvContent.toString().getBytes(StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=careflow_staff_doctors.csv")
                .header(HttpHeaders.CONTENT_TYPE, "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    private String escapeCsvField(String field) {
        if (field == null) {
            return "";
        }
        if (field.contains(",") || field.contains("\"") || field.contains("\n") || field.contains("\r")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctorById(@PathVariable Long id) {
        return doctorService.getDoctorById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody DoctorUpdateRequest request) {
        try {
            Doctor updatedDoctor = doctorService.updateDoctor(
                    id,
                    request.getName(),
                    request.getSpecialization()
            );
            return ResponseEntity.ok(updatedDoctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteDoctor(id);
            return ResponseEntity.ok(new MessageResponse("Doctor deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @lombok.Data
    public static class DoctorUpdateRequest {
        private String name;
        private String specialization;
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
