package com.hospital.system.repository;

import com.hospital.system.model.Appointment;
import com.hospital.system.model.Doctor;
import com.hospital.system.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientOrderByAppointmentDateAsc(Patient patient);
    List<Appointment> findByDoctorOrderByAppointmentDateAsc(Doctor doctor);
}
