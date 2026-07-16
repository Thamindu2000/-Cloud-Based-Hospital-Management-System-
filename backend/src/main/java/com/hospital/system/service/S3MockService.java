
package com.hospital.system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.ServerSideEncryption;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3MockService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    private S3Client getS3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .build();
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String generatedFilename = UUID.randomUUID().toString() + extension;

        S3Client s3Client = getS3Client();
        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(generatedFilename)
                .serverSideEncryption(ServerSideEncryption.AES256)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        s3Client.close();

        return "http://localhost:8080/api/files/" + generatedFilename;
    }

    public Resource loadFileAsResource(String filename) {
        S3Client s3Client = getS3Client();
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(filename)
                .build();

        return new InputStreamResource(s3Client.getObject(getRequest));
    }
}

