package com.hospital.system.controller;

import com.hospital.system.model.User;
import com.hospital.system.repository.UserRepository;
import com.hospital.system.service.S3StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private S3StorageService s3StorageService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("username", user.getUsername());
        profile.put("fullName", user.getFullName());
        profile.put("profilePictureUrl", user.getProfilePictureUrl());
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam("username") String newUsername,
            @RequestParam("fullName") String fullName,
            @RequestParam(value = "currentPassword", required = false) String currentPassword,
            @RequestParam(value = "newPassword", required = false) String newPassword,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            Authentication authentication) throws IOException {

        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        // If username changes, verify uniqueness
        if (!newUsername.equals(currentUsername)) {
            if (userRepository.findByUsername(newUsername).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Username already in use"));
            }
            user.setUsername(newUsername);
        }

        user.setFullName(fullName);

        // Handle Password Change if requested
        if (currentPassword != null && !currentPassword.isEmpty() && newPassword != null && !newPassword.isEmpty()) {
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
            }
            if (newPassword.length() < 8) {
                return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 8 characters"));
            }
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        if (photo != null && !photo.isEmpty()) {
            // Delete old photo if it exists on S3
            if (user.getProfilePictureUrl() != null && user.getProfilePictureUrl().contains("/api/files/")) {
                try {
                    String oldFilename = user.getProfilePictureUrl().substring(user.getProfilePictureUrl().lastIndexOf("/") + 1);
                    s3StorageService.deleteFile(oldFilename);
                } catch (Exception e) {
                    System.err.println("Could not delete old profile picture from S3: " + e.getMessage());
                }
            }

            // Upload new photo to S3
            String photoUrl = s3StorageService.uploadFile(photo);
            user.setProfilePictureUrl(photoUrl);
        }

        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("profilePictureUrl", user.getProfilePictureUrl());
        return ResponseEntity.ok(response);
    }
}
