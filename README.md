# CareFlow HMS — Cloud-Based Hospital Management System

A full-stack, cloud-native hospital management system built as part of the **Cloud Computing** module coursework (Option C: Cloud-Based Hospital Management System). The system is deployed on **AWS**, using managed database, object storage, auto-scaling, and IAM-based security throughout.

**Live deployment:** `http://13.51.255.252`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [AWS Infrastructure](#aws-infrastructure)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Security](#security)
- [Local Development Setup](#local-development-setup)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Known Limitations](#known-limitations)
- [Team](#team)

---

## Overview

CareFlow HMS digitizes core hospital operations for a mid-sized facility:

- **Patients** can register, log in, manage their health profile, book appointments with specialists, and upload/view their own medical scans.
- **Doctors** can view their appointment schedule, approve or cancel bookings, and review patient medical images.
- **Admins** have full visibility and control over all patients, doctors, and appointments in the system.

The system was deliberately built as a **cloud-native** application — it doesn't just run *on* a cloud VM, it uses managed cloud services (S3, RDS, IAM, Auto Scaling) as first-class parts of the architecture, not afterthoughts.

---

## Architecture

```
                              Internet
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   EC2 Instance (t3.micro)│
                     │  Auto Scaling Group      │
                     │  (min:1, max:2, 2 AZs)   │
                     │                           │
                     │  ┌─────────────────────┐  │
                     │  │  Docker: Nginx       │  │      ┌───────────────┐
                     │  │  (Frontend - React)  │──┼─────▶│   Port 80     │
                     │  └─────────────────────┘  │      └───────────────┘
                     │             │              │
                     │             ▼              │
                     │  ┌─────────────────────┐  │      ┌───────────────┐
                     │  │  Docker: Spring Boot │──┼─────▶│   Port 8080   │
                     │  │  (Backend - REST API)│  │      └───────────────┘
                     │  └─────────────────────┘  │
                     │             │              │
                     └─────────────┼──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼                             ▼
          ┌───────────────────┐        ┌────────────────────┐
          │   AWS RDS (MySQL)  │        │    AWS S3 Bucket    │
          │   hospital_db      │        │  Medical Imaging     │
          │   SSL-encrypted     │        │  SSE-S3 encrypted    │
          │   Automated backups │        │  Lifecycle → Glacier │
          └───────────────────┘        └────────────────────┘

          IAM Role (hospital-ec2-s3-role) — no static AWS keys,
          EC2 authenticates to S3 via instance profile only.

          CloudWatch Alarms — CPU-based target tracking (60%)
          drives the Auto Scaling Group scale-out/scale-in.
```

**Design decisions:**
- **Containerized (Docker)** rather than bare-metal install — makes the app portable and matches how real production Spring Boot / React apps are shipped.
- **Managed RDS instead of a database container** — durability, automated backups, and encryption are handled by AWS rather than re-implemented.
- **Real S3, not local disk** — medical images are irreplaceable patient data; they belong in durable, versioned, encrypted object storage, not a container's ephemeral filesystem.
- **IAM role over access keys** — the EC2 instance authenticates to S3 using an attached IAM role (`hospital-ec2-s3-role`), so no AWS credentials are ever stored in code, config, or environment variables.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3.3.1, Spring Data JPA (Hibernate), Spring Security, JWT (jjwt) |
| **Frontend** | React 18.3.1, React Router 6.24.1, Axios, Tailwind CSS, Framer Motion |
| **Database** | AWS RDS (MySQL 8.0), SSL-enforced connections |
| **Object Storage** | AWS S3 (SSE-S3 encryption, versioning, lifecycle policies) |
| **Compute** | AWS EC2 (t3.micro) behind an Auto Scaling Group, Docker + Docker Compose |
| **Identity & Access** | AWS IAM (instance role for S3, no static keys) |
| **Monitoring** | AWS CloudWatch (CPU-based scaling alarms) |
| **Web Server** | Nginx (reverse proxy for the React build) |
| **Testing** | JUnit 5, Mockito, Postman (functional + load testing) |

---

## Features

### Patient
- Register / log in (JWT-based auth)
- View and edit personal health profile (name, age, blood group, medical history)
- Book appointments with a specialist by name/specialization
- View own appointment history and status
- Upload medical scans (X-rays, reports) with a description — stored in S3
- View previously uploaded scans

### Doctor
- View assigned appointments
- Approve or cancel appointment requests
- View a patient's uploaded medical images

### Admin
- View, edit, and delete any patient or doctor profile
- View all appointments across the system
- Full system oversight

---

## AWS Infrastructure

| Component | Configuration |
|---|---|
| **VPC / Networking** | Default VPC, 2 Availability Zones (`eu-north-1a`, `eu-north-1b`) |
| **Compute** | EC2 `t3.micro`, custom AMI, Launch Template, Auto Scaling Group (min 1 / max 2) |
| **Auto Scaling Policy** | Target tracking — scales on average CPU utilization (target: 60%) |
| **Database** | RDS MySQL 8.0, SSL-enforced, automated backups enabled |
| **Storage** | S3 bucket (`hospital-medical-imaging-*`) — private, versioned, SSE-S3 encrypted, lifecycle rule transitions objects to Glacier after 90 days |
| **IAM** | `hospital-ec2-s3-role` — least-privilege policy scoped to `s3:GetObject`, `s3:PutObject`, `s3:ListBucket` on the specific bucket only |
| **Monitoring** | CloudWatch alarms tied to the Auto Scaling target tracking policy |
| **Security Groups** | SSH restricted to a specific IP; HTTP (80), API (8080) open; HTTPS (443) reserved for TLS |

---

## API Reference

Base URL: `http://<host>:8080/api`

### Auth (public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Authenticate, returns JWT |
| POST | `/auth/register/patient` | Register a new patient |
| POST | `/auth/register/doctor` | Register a new doctor |

### Patients
| Method | Endpoint | Role |
|---|---|---|
| GET | `/patients` | ADMIN, DOCTOR |
| GET | `/patients/{id}` | ADMIN, DOCTOR, own PATIENT |
| PUT | `/patients/{id}` | ADMIN, own PATIENT |
| DELETE | `/patients/{id}` | ADMIN |

### Doctors
| Method | Endpoint | Role |
|---|---|---|
| GET | `/doctors` | Authenticated |
| GET | `/doctors/{id}` | Authenticated |
| PUT | `/doctors/{id}` | ADMIN |
| DELETE | `/doctors/{id}` | ADMIN |

### Appointments
| Method | Endpoint | Role |
|---|---|---|
| POST | `/appointments/book` | PATIENT |
| GET | `/appointments/patient/{patientId}` | PATIENT, ADMIN |
| GET | `/appointments/doctor/{doctorId}` | DOCTOR, ADMIN |
| GET | `/appointments` | ADMIN |
| PUT | `/appointments/{id}/status` | DOCTOR, ADMIN |

### Medical Images
| Method | Endpoint | Role |
|---|---|---|
| POST | `/medical-images/upload` | PATIENT, ADMIN |
| GET | `/medical-images/patient/{patientId}` | PATIENT, DOCTOR, ADMIN |
| GET | `/files/{filename}` | Public (S3-proxied download) |

---

## Database Schema

| Table | Key Fields |
|---|---|
| `users` | id, username (unique), password (bcrypt), role (`ADMIN`/`DOCTOR`/`PATIENT`) |
| `patients` | id, user_id (FK), name, age, blood_group, medical_history |
| `doctors` | id, user_id (FK), name, specialization |
| `appointments` | id, patient_id (FK), doctor_id (FK), appointment_date, status |
| `medical_images` | id, patient_id (FK), file_url, description, uploaded_at |

Schema is managed by Hibernate (`spring.jpa.hibernate.ddl-auto=update`) — tables and columns are created/altered automatically from the JPA entity definitions on startup.

---

## Security

- **Authentication**: JWT (HS256), stateless sessions
- **Password hashing**: BCrypt
- **Authorization**: Role-based access control (`@PreAuthorize` / Spring Security filter chain), enforced per-endpoint
- **Secrets management**: No hardcoded credentials — DB password, JWT secret, and S3 config are all injected via environment variables (`.env`, not committed to git)
- **AWS access**: IAM instance role only — zero static AWS access keys anywhere in the codebase
- **Database connection**: SSL-enforced (`useSSL=true`) in production
- **Object storage**: Server-side encryption (SSE-S3/AES256) on every uploaded file; bucket is private with all public access blocked
- **CORS**: Explicit allow-list of origins (no wildcard `*`)

---

## Local Development Setup

### Prerequisites
- Docker & Docker Compose
- An AWS account with an S3 bucket and RDS MySQL instance (or adapt `docker-compose.yml` to run a local MySQL container for development)

### Steps

```bash
git clone https://github.com/Thamindu2000/-Cloud-Based-Hospital-Management-System-.git
cd -Cloud-Based-Hospital-Management-System-

# Copy the example env file and fill in real values
cp .env.example .env
nano .env
```

Fill in `.env`:
```
DB_URL=jdbc:mysql://<your-rds-endpoint>:3306/hospital_db?useSSL=true
DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>
JWT_SECRET=<a-random-256-bit-hex-string>
AWS_REGION=<your-region>
S3_BUCKET_NAME=<your-bucket-name>
```

```bash
docker compose up -d --build
```

- Frontend: `http://localhost`
- Backend API: `http://localhost:8080`

> **Note:** AWS credentials are *not* set via environment variables when running on EC2 — the app relies on the attached IAM instance role. For local development off EC2, you will need to configure AWS credentials another way (e.g. `~/.aws/credentials`) since `DefaultCredentialsProvider` is used.

---

## Deployment

The production deployment runs on a single EC2 instance behind an Auto Scaling Group:

1. A custom AMI is baked from a configured EC2 instance (Docker + app pre-installed).
2. A Launch Template references that AMI.
3. An Auto Scaling Group (min 1, max 2, across 2 AZs) uses the Launch Template, with a CPU-based target tracking scaling policy.
4. `docker compose up -d --build` builds and runs the frontend and backend containers on each instance.
5. Both containers connect out to the shared RDS database and S3 bucket — state is not stored on the instance itself, so it can scale horizontally.

---

## Testing

- **Unit / integration tests** (JUnit 5 + Mockito): `AuthControllerTest`, `AppointmentControllerTest`, `UserServiceTest`, `PatientServiceTest` (testing authentication logic, appointment booking status, password hashing, and patient profile fields mapping/normalization) — run via `mvn test`
- **Load testing** (Postman): 20 virtual users, 1-minute run, 365 total requests across Login / Get All Doctors / Get All Patients — **0% error rate**, average response time 2.86s, P95 4.66s

---

## Project Structure

```
.
├── backend/
│   ├── src/main/java/com/hospital/system/
│   │   ├── controller/       # REST controllers
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # JWT + Spring Security config
│   │   └── service/            # Business logic, S3 integration
│   ├── src/test/java/...      # Unit & integration tests
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/        # React components / dashboards
│   │   └── services/api.js    # Axios API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `DB_URL` | JDBC connection string for RDS MySQL |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Signing key for JWTs (HS256, 256-bit) |
| `AWS_REGION` | AWS region for S3 |
| `S3_BUCKET_NAME` | Target S3 bucket for medical images |

AWS credentials for S3 access are **not** set as environment variables in production — they're provided automatically via the EC2 instance's attached IAM role.

---

## Known Limitations

- Single-region deployment (`eu-north-1`) — no multi-region redundancy
- HTTPS/TLS termination for the web app is not yet configured (currently HTTP only; RDS connection itself is SSL-encrypted)
- No CI/CD pipeline — deployment is manual via SSH + `docker compose`
- Load testing was limited in scale (20 virtual users); a larger-scale test (e.g. JMeter with hundreds of users) would give a more complete picture under heavy load
- No WAF or DDoS protection in front of the API

---

## Team

Group project for the Cloud Computing module — Option C: Cloud-Based Hospital Management System.
