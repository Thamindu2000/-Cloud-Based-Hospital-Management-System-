package com.hospital.system.service;

import com.hospital.system.model.Patient;
import com.hospital.system.model.Role;
import com.hospital.system.model.User;
import com.hospital.system.repository.PatientRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private PatientService patientService;

    @Test
    public void testRegisterPatientCorrectlyMapsAndSavesFields() {
        User user = User.builder().id(10L).username("pat1").role(Role.PATIENT).build();
        when(userService.registerUser("pat1", "password", Role.PATIENT)).thenReturn(user);

        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        Patient registered = patientService.registerPatient(
                "pat1",
                "password",
                "John Doe",
                30,
                "O+",
                "No major issues"
        );

        assertNotNull(registered);
        assertEquals(1L, registered.getId());
        assertEquals("John Doe", registered.getName());
        assertEquals(30, registered.getAge());
        assertEquals("O+", registered.getBloodGroup());
        assertEquals("No major issues", registered.getMedicalHistory());
        assertEquals(user, registered.getUser());

        verify(userService, times(1)).registerUser("pat1", "password", Role.PATIENT);
        verify(patientRepository, times(1)).save(any(Patient.class));
    }

    @Test
    public void testRegisterPatientNormalizesBloodGroup() {
        User user = User.builder().id(10L).username("pat2").role(Role.PATIENT).build();
        when(userService.registerUser("pat2", "password", Role.PATIENT)).thenReturn(user);

        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Patient registeredWithUnknown = patientService.registerPatient(
                "pat2",
                "password",
                "Jane Smith",
                25,
                "Unknown",
                "None"
        );

        assertNotNull(registeredWithUnknown);
        assertNull(registeredWithUnknown.getBloodGroup());

        Patient registeredWithEmpty = patientService.registerPatient(
                "pat2",
                "password",
                "Jane Smith",
                25,
                "   ",
                "None"
        );

        assertNotNull(registeredWithEmpty);
        assertNull(registeredWithEmpty.getBloodGroup());
    }
}
