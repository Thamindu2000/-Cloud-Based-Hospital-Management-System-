package com.hospital.system.service;

import com.hospital.system.model.*;
import com.hospital.system.repository.DoctorRepository;
import com.hospital.system.repository.PatientRepository;
import com.hospital.system.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Admin
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("Seeded admin account: admin / admin123");
        }

        // 2. Seed Doctors
        if (userRepository.findByUsername("doctor1").isEmpty()) {
            User userDoc1 = User.builder()
                    .username("doctor1")
                    .password(passwordEncoder.encode("doc123"))
                    .role(Role.DOCTOR)
                    .build();
            
            Doctor doc1 = Doctor.builder()
                    .user(userDoc1)
                    .name("Dr. Elizabeth Blackwell")
                    .specialization("Cardiology")
                    .build();
            doctorRepository.save(doc1);
            System.out.println("Seeded doctor account: doctor1 / doc123");
        }

        if (userRepository.findByUsername("doctor2").isEmpty()) {
            User userDoc2 = User.builder()
                    .username("doctor2")
                    .password(passwordEncoder.encode("doc123"))
                    .role(Role.DOCTOR)
                    .build();

            Doctor doc2 = Doctor.builder()
                    .user(userDoc2)
                    .name("Dr. Gregory House")
                    .specialization("Diagnostic Medicine")
                    .build();
            doctorRepository.save(doc2);
            System.out.println("Seeded doctor account: doctor2 / doc123");
        }

        // 3. Seed Patients
        if (userRepository.findByUsername("patient1").isEmpty()) {
            User userPat1 = User.builder()
                    .username("patient1")
                    .password(passwordEncoder.encode("pat123"))
                    .role(Role.PATIENT)
                    .build();

            Patient pat1 = Patient.builder()
                    .user(userPat1)
                    .name("John Doe")
                    .age(35)
                    .bloodGroup("O+")
                    .medicalHistory("No known drug allergies. History of mild asthma.")
                    .build();
            patientRepository.save(pat1);
            System.out.println("Seeded patient account: patient1 / pat123");
        }

        if (userRepository.findByUsername("patient2").isEmpty()) {
            User userPat2 = User.builder()
                    .username("patient2")
                    .password(passwordEncoder.encode("pat123"))
                    .role(Role.PATIENT)
                    .build();

            Patient pat2 = Patient.builder()
                    .user(userPat2)
                    .name("Jane Smith")
                    .age(29)
                    .bloodGroup("A-")
                    .medicalHistory("Hypertension. Penicillin allergy.")
                    .build();
            patientRepository.save(pat2);
            System.out.println("Seeded patient account: patient2 / pat123");
        }
    }
}
