package com.hospital.system.service;

import com.hospital.system.model.MedicalImage;
import com.hospital.system.model.Patient;
import com.hospital.system.repository.MedicalImageRepository;
import com.hospital.system.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class MedicalImageService {

    @Autowired
    private MedicalImageRepository medicalImageRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private S3MockService s3MockService;

    @Transactional
    public MedicalImage uploadMedicalImage(Long patientId, MultipartFile file, String description) throws IOException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        String fileUrl = s3MockService.uploadFile(file);

        MedicalImage medicalImage = MedicalImage.builder()
                .patient(patient)
                .fileUrl(fileUrl)
                .description(description)
                .uploadedAt(LocalDateTime.now())
                .build();

        return medicalImageRepository.save(medicalImage);
    }

    public List<MedicalImage> getImagesForPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return medicalImageRepository.findByPatientOrderByUploadedAtDesc(patient);
    }
}
