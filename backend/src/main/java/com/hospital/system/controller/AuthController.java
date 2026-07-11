package com.hospital.system.controller;

import com.hospital.system.model.Doctor;
import com.hospital.system.model.Patient;
import com.hospital.system.model.User;
import com.hospital.system.security.JwtTokenProvider;
import com.hospital.system.service.DoctorService;
import com.hospital.system.service.PatientService;
import com.hospital.system.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private DoctorService doctorService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        String username = authentication.getName();
        String role = tokenProvider.getRoleFromJwt(jwt);

        Long profileId = null;
        if (role.equals("ROLE_PATIENT")) {
            Optional<Patient> patient = patientService.getPatientByUsername(username);
            if (patient.isPresent()) {
                profileId = patient.get().getId();
            }
        } else if (role.equals("ROLE_DOCTOR")) {
            Optional<Doctor> doctor = doctorService.getDoctorByUsername(username);
            if (doctor.isPresent()) {
                profileId = doctor.get().getId();
            }
        }

        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt, username, role, profileId));
    }

    @PostMapping("/register/patient")
    public ResponseEntity<?> registerPatient(@RequestBody PatientRegisterRequest request) {
        try {
            Patient patient = patientService.registerPatient(
                    request.getUsername(),
                    request.getPassword(),
                    request.getName(),
                    request.getAge(),
                    request.getBloodGroup(),
                    request.getMedicalHistory()
            );
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/register/doctor")
    public ResponseEntity<?> registerDoctor(@RequestBody DoctorRegisterRequest request) {
        try {
            Doctor doctor = doctorService.registerDoctor(
                    request.getUsername(),
                    request.getPassword(),
                    request.getName(),
                    request.getSpecialization()
            );
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Requests and Responses DTOs
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class JwtAuthenticationResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private String username;
        private String role;
        private Long profileId;

        public JwtAuthenticationResponse(String accessToken, String username, String role, Long profileId) {
            this.accessToken = accessToken;
            this.username = username;
            this.role = role;
            this.profileId = profileId;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientRegisterRequest {
        private String username;
        private String password;
        private String name;
        private Integer age;
        private String bloodGroup;
        private String medicalHistory;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorRegisterRequest {
        private String username;
        private String password;
        private String name;
        private String specialization;
    }

    @Data
    @AllArgsConstructor
    public static class MessageResponse {
        private String message;
    }
}
