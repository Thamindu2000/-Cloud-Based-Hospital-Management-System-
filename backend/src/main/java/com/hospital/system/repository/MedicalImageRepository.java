package com.hospital.system.repository;

import com.hospital.system.model.MedicalImage;
import com.hospital.system.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicalImageRepository extends JpaRepository<MedicalImage, Long> {
    List<MedicalImage> findByPatientOrderByUploadedAtDesc(Patient patient);
}
