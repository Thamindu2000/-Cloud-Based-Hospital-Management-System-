package com.hospital.system.service;

import com.hospital.system.model.Doctor;
import com.hospital.system.model.Role;
import com.hospital.system.model.User;
import com.hospital.system.model.Appointment;
import com.hospital.system.repository.DoctorRepository;
import com.hospital.system.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Transactional
    public Doctor registerDoctor(String username, String password, String name, String specialization) {
        User user = userService.registerUser(username, password, Role.DOCTOR);

        Doctor doctor = Doctor.builder()
                .user(user)
                .name(name)
                .specialization(specialization)
                .build();

        return doctorRepository.save(doctor);
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public Optional<Doctor> getDoctorByUserId(Long userId) {
        return doctorRepository.findByUserId(userId);
    }

    public Optional<Doctor> getDoctorByUsername(String username) {
        return userService.findByUsername(username)
                .flatMap(user -> doctorRepository.findByUser(user));
    }

    @Transactional
    public Doctor updateDoctor(Long id, String name, String specialization) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        return doctorRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        List<Appointment> appointments = appointmentRepository.findByDoctorOrderByAppointmentDateAsc(doctor);
        appointmentRepository.deleteAll(appointments);
        
        doctorRepository.delete(doctor);
    }
}
