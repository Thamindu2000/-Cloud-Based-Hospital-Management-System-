package com.hospital.system.controller;

import com.hospital.system.security.CustomUserDetailsService;
import com.hospital.system.security.JwtAuthenticationFilter;
import com.hospital.system.security.JwtTokenProvider;
import com.hospital.system.service.DoctorService;
import com.hospital.system.service.PatientService;
import com.hospital.system.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import org.springframework.context.annotation.Import;
import com.hospital.system.security.SecurityConfig;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import(SecurityConfig.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthenticationManager authenticationManager;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private UserService userService;

    @MockBean
    private PatientService patientService;

    @MockBean
    private DoctorService doctorService;

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
    public void testLoginReturnsJwtAnd200() throws Exception {
        Authentication authentication = Mockito.mock(Authentication.class);
        when(authentication.getName()).thenReturn("patient1");
        
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_PATIENT");
        Mockito.doReturn(Collections.singletonList(authority)).when(authentication).getAuthorities();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(any(Authentication.class)))
                .thenReturn("dummy-jwt-token");
        when(tokenProvider.getRoleFromJwt("dummy-jwt-token"))
                .thenReturn("ROLE_PATIENT");
        when(patientService.getPatientByUsername("patient1"))
                .thenReturn(Optional.empty());

        String loginJson = "{\"username\":\"patient1\",\"password\":\"pat123\"}";

        mockMvc.perform(post("/api/auth/login")
                .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("dummy-jwt-token"))
                .andExpect(jsonPath("$.username").value("patient1"))
                .andExpect(jsonPath("$.role").value("ROLE_PATIENT"));
    }

    @Test
    public void testRegisterPatientWithoutAuthAndWithoutCsrf() throws Exception {
        com.hospital.system.model.Patient patient = new com.hospital.system.model.Patient();
        patient.setId(1L);
        com.hospital.system.model.User user = new com.hospital.system.model.User();
        user.setUsername("newpatient");
        patient.setUser(user);
        patient.setName("New Patient");

        when(patientService.registerPatient(any(), any(), any(), any(Integer.class), any(), any()))
                .thenReturn(patient);

        String registerJson = "{\"username\":\"newpatient\",\"password\":\"pass123\",\"name\":\"New Patient\",\"age\":25,\"bloodGroup\":\"O+\",\"medicalHistory\":\"None\"}";

        mockMvc.perform(post("/api/auth/register/patient")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.username").value("newpatient"))
                .andExpect(jsonPath("$.name").value("New Patient"));
    }
}
