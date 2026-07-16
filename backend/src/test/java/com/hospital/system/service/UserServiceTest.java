package com.hospital.system.service;

import com.hospital.system.model.Role;
import com.hospital.system.model.User;
import com.hospital.system.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @Test
    public void testRegisterUserHashesPasswordBeforeSaving() {
        String rawPassword = "mypassword";
        String encodedPassword = "hashedpassword_12345";

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User registeredUser = userService.registerUser("testuser", rawPassword, Role.PATIENT);

        assertNotNull(registeredUser);
        assertEquals("testuser", registeredUser.getUsername());
        assertEquals(encodedPassword, registeredUser.getPassword());
        assertEquals(Role.PATIENT, registeredUser.getRole());

        verify(passwordEncoder, times(1)).encode(rawPassword);
        verify(userRepository, times(1)).save(any(User.class));
    }
}
