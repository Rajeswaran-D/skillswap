-- ========================================================
-- SkillSwap – Student Skill Exchange Platform Database
-- Exactly 3 Tables: students, skills, requests
-- ========================================================

CREATE DATABASE IF NOT EXISTS skillswap;
USE skillswap;

-- 1. Students Table
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Skills Table (Skills a student can teach or wants to learn)
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_type ENUM('TEACH', 'LEARN') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 3. Requests Table (Exchange requests between students)
CREATE TABLE requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    skill_id INT NOT NULL,
    message VARCHAR(255),
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- --------------------------------------------------------
-- Sample Records
-- Passwords hashed using standard password_hash('123456', PASSWORD_DEFAULT)
-- --------------------------------------------------------

INSERT INTO students (id, name, email, password, department) VALUES
(1, 'Rahul Sharma', 'rahul@college.edu', '$2y$10$eA0n8L2jYgJ5x.eA27QGTuXWkWaVdYQ2aQc8pM3.9y5V3Wj4cZ0iO', 'Computer Science'),
(2, 'Priya Patel', 'priya@college.edu', '$2y$10$eA0n8L2jYgJ5x.eA27QGTuXWkWaVdYQ2aQc8pM3.9y5V3Wj4cZ0iO', 'Information Tech'),
(3, 'Amit Verma', 'amit@college.edu', '$2y$10$eA0n8L2jYgJ5x.eA27QGTuXWkWaVdYQ2aQc8pM3.9y5V3Wj4cZ0iO', 'Electronics');
-- Note: Default password for all sample accounts is: 123456

INSERT INTO skills (id, student_id, skill_name, skill_type, description) VALUES
(1, 1, 'Python Programming', 'TEACH', 'Can teach basic Python, functions and loops'),
(2, 1, 'UI/UX Design', 'LEARN', 'Want to learn Figma and wireframing'),
(3, 2, 'UI/UX Design (Figma)', 'TEACH', 'Can teach design fundamentals in Figma'),
(4, 2, 'Java Servlets', 'LEARN', 'Want to learn Java web development'),
(5, 3, 'Arduino & IoT', 'TEACH', 'Can teach Arduino coding and circuit sensors');

INSERT INTO requests (id, sender_id, receiver_id, skill_id, message, status) VALUES
(1, 1, 2, 3, 'Hi Priya, I want to learn Figma from you. I can teach you Python in return!', 'PENDING');
