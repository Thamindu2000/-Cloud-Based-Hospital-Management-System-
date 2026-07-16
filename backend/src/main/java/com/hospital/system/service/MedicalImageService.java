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
    private S3StorageService s3StorageService;

    @Transactional(rollbackFor = Exception.class)
    public MedicalImage uploadMedicalImage(Long patientId, MultipartFile file, String description) throws IOException {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        String fileUrl = s3StorageService.uploadFile(file);

        try {
            MedicalImage medicalImage = MedicalImage.builder()
                    .patient(patient)
                    .fileUrl(fileUrl)
                    .description(description)
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return medicalImageRepository.save(medicalImage);
        } catch (Exception e) {
            try {
                String filename = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                s3StorageService.deleteFile(filename);
            } catch (Exception ex) {
                // Log or print deletion failure
                ex.printStackTrace();
            }
            throw e;
        }
    }

    public List<MedicalImage> getImagesForPatient(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        return medicalImageRepository.findByPatientOrderByUploadedAtDesc(patient);
    }
}
