package com.hospital.system.service;

import com.hospital.system.model.Patient;
import com.hospital.system.model.Role;
import com.hospital.system.model.User;
import com.hospital.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserService userService;

    @Transactional
    public Patient registerPatient(String username, String password, String name, Integer age, String bloodGroup, String medicalHistory) {
        User user = userService.registerUser(username, password, Role.PATIENT);
        
        String normalizedBloodGroup = (bloodGroup == null || bloodGroup.trim().isEmpty() || bloodGroup.equalsIgnoreCase("Unknown")) ? null : bloodGroup;

        Patient patient = Patient.builder()
                .user(user)
                .name(name)
                .age(age)
                .bloodGroup(normalizedBloodGroup)
                .medicalHistory(medicalHistory)
                .build();
        
        return patientRepository.save(patient);
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    public Optional<Patient> getPatientByUserId(Long userId) {
        return patientRepository.findByUserId(userId);
    }

    public Optional<Patient> getPatientByUsername(String username) {
        return userService.findByUsername(username)
                .flatMap(user -> patientRepository.findByUser(user));
    }

    @Transactional
    public Patient updatePatient(Long id, String name, Integer age, String bloodGroup, String medicalHistory) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        String normalizedBloodGroup = (bloodGroup == null || bloodGroup.trim().isEmpty() || bloodGroup.equalsIgnoreCase("Unknown")) ? null : bloodGroup;
        
        patient.setName(name);
        patient.setAge(age);
        patient.setBloodGroup(normalizedBloodGroup);
        patient.setMedicalHistory(medicalHistory);
        
        return patientRepository.save(patient);
    }

    @Transactional
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        patientRepository.delete(patient);
    }
}
