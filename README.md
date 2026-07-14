🏥 Cloud-Based Hospital Management System
This is a comprehensive, cloud-based Hospital Management System developed to streamline patient registration, appointment scheduling, and medical record management. Built with a robust full-stack architecture, it ensures seamless interaction between patients, doctors, and system administrators.

🚀 Key Features
Patient Dashboard & Booking Portal: Allows patients to manage their profiles, book appointments with specialists, and track appointment statuses in real-time.

Integrated Medical Record Storage: Provides a secure interface for patients to upload medical scans (PDF, JPG, PNG) and for doctors to review these records instantly.

Doctor Dashboard: Enables doctors to view their scheduled appointments, patient details, and medical records to facilitate informed clinical decisions.

Role-Based Access Control: Secure system ensuring patients and doctors only access authorized data via JWT-based authentication.

Dynamic Cloud Deployment: Fully deployed on AWS EC2, featuring automated build processes and environment-based configuration management.

🛠️ Technical Stack
Frontend: React.js, Tailwind CSS, Axios.

Backend: Java Spring Boot, MySQL.

Cloud & Infrastructure: AWS EC2, PM2 Process Manager, Git, Nginx (for proxying).

💡 How it Works
Patient Flow: Patients register, log in, update their health profiles (age, blood group, medical history), and upload medical scans (scans are handled via dynamic URL formatting for secure retrieval).

Booking: Patients select a specialist from a dynamically populated list and book an appointment at a preferred date/time.

Doctor Interaction: Doctors view their specific appointment queue and can access a patient's uploaded medical scans through an integrated, user-friendly Modal interface.

⚙️ Deployment & Running
Prerequisites
Node.js & npm (for frontend).

Java (JDK) & Maven (for backend).

MySQL Database.

Steps to Run
Backend: Configure the application.properties with your database credentials and start the Spring Boot application.

Frontend:

Bash
# Install dependencies
npm install
# Build for production
npm run build
# Serve using PM2
pm2 start npm --name "hospital-site" -- run start
📝 Project Status
This project is currently active and used for managing hospital operations, continuously evolving with new features like real-time notifications and enhanced analytics.
