package com.hospital.system.controller;

import com.hospital.system.model.Appointment;
import com.hospital.system.model.Doctor;
import com.hospital.system.model.Patient;
import com.hospital.system.security.CustomUserDetailsService;
import com.hospital.system.security.JwtAuthenticationFilter;
import com.hospital.system.security.JwtTokenProvider;
import com.hospital.system.service.AppointmentService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import org.springframework.context.annotation.Import;
import com.hospital.system.security.SecurityConfig;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AppointmentController.class)
@Import(SecurityConfig.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() throws Exception {
        Mockito.doAnswer(invocation -> {
            jakarta.servlet.ServletRequest request = invocation.getArgument(0);
            jakarta.servlet.ServletResponse response = invocation.getArgument(1);
            jakarta.servlet.FilterChain filterChain = invocation.getArgument(2);
            filterChain.doFilter(request, response);
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(roles = "PATIENT")
    public void testBookAppointmentPersistsBookingWithPendingStatus() throws Exception {
        Patient patient = Patient.builder().id(1L).name("John Doe").build();
        Doctor doctor = Doctor.builder().id(2L).name("Dr. Blackwell").build();
        LocalDateTime testDate = LocalDateTime.of(2026, 8, 20, 10, 0, 0);

        Appointment mockAppointment = Appointment.builder()
                .id(100L)
                .patient(patient)
                .doctor(doctor)
                .appointmentDate(testDate)
                .status("PENDING")
                .build();

        when(appointmentService.bookAppointment(eq(1L), eq(2L), any(LocalDateTime.class)))
                .thenReturn(mockAppointment);

        String bookRequestJson = "{\"patientId\":1,\"doctorId\":2,\"appointmentDate\":\"2026-08-20T10:00:00\"}";

        mockMvc.perform(post("/api/appointments/book")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookRequestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100L))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.patient.name").value("John Doe"))
                .andExpect(jsonPath("$.doctor.name").value("Dr. Blackwell"));
    }
}
