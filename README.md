# SkillSwap – Student Skill Exchange Platform

A very simple, beginner-friendly peer-to-peer web application that enables college students to share skills they know and find peers who can teach skills they want to learn.

---

## 📌 Technology Stack

- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Backend (Student Auth & Views):** PHP
- **Backend (Form Processing):** Java Servlets (JDBC)
- **Database:** MySQL (Shared across PHP and Servlets)
- **Servers:** XAMPP (Apache + MySQL) and Apache Tomcat

---

## 🗄️ Database Architecture (Only 3 Tables)

The database `skillswap` contains exactly three tables:

1. `students` – Stores registered student details (Name, Email, Hashed Password, Department).
2. `skills` – Stores skills offered (`TEACH`) or wanted (`LEARN`) linked to students.
3. `requests` – Stores exchange proposals (`sender_id`, `receiver_id`, `skill_id`, `message`, `status`: `PENDING`, `ACCEPTED`, `REJECTED`).

---

## 📂 Project Folder Structure

```text
wt/
├── start.bat                       # One-click start file (double-click to run & open browser)
├── run_app.py                      # Standalone instant runner (Zero dependencies)
├── database/
│   └── skillswap.sql               # MySQL database schema and sample seed records
├── php/                            # Place in C:\xampp\htdocs\skillswap
│   ├── config.php                  # Database connection (PDO) and session tracking
│   ├── register.php                # Module 1: Student registration form with validation
│   ├── login.php                   # Module 1: Student login form with password verification
│   ├── logout.php                  # Module 1: Session termination
│   ├── index.php                   # Module 2 & 3: Main student dashboard & request center
│   └── style.css                   # Custom styles
├── servlets/                       # Deploy to Tomcat webapps/skillswap-servlets
│   ├── src/
│   │   ├── AddSkillServlet.java    # Module 2: Processes skill form submissions via JDBC
│   │   └── ProcessRequestServlet.java # Module 3: Processes send, accept, reject requests
│   ├── WEB-INF/
│   │   └── web.xml                 # Servlet mapping configuration
│   └── compile.bat                 # One-click Windows compile script
└── README.md                       # Setup and testing instructions
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Start XAMPP & Import MySQL Database
1. Open **XAMPP Control Panel**.
2. Start both **Apache** and **MySQL**.
3. Open your browser and navigate to `http://localhost/phpmyadmin/`.
4. Click **Import** > Choose file: `database/skillswap.sql` > Click **Go**.
   *(This creates the `skillswap` database with sample student accounts and skills).*

### Step 2: Deploy PHP Application to XAMPP
1. Copy the entire `php` folder to your XAMPP `htdocs` directory:
   ```text
   C:\xampp\htdocs\skillswap
   ```
2. Your PHP application is now accessible at: `http://localhost/skillswap/`.

### Step 3: Setup & Run Java Servlets in Apache Tomcat
1. Copy the `servlets` folder to your Tomcat `webapps` directory and rename it to `skillswap-servlets`:
   ```text
   C:\apache-tomcat-9.0\webapps\skillswap-servlets\
   ```
2. Ensure MySQL Connector JAR (`mysql-connector-j-8.x.x.jar`) is placed in:
   ```text
   C:\apache-tomcat-9.0\lib\
   ```
   *(Or inside `skillswap-servlets\WEB-INF\lib\`)*.
3. Compile the servlet source files into `WEB-INF/classes/` by running `compile.bat` or executing:
   ```cmd
   javac -cp "C:\apache-tomcat-9.0\lib\servlet-api.jar" -d "WEB-INF\classes" src\AddSkillServlet.java src\ProcessRequestServlet.java
   ```
4. Start Apache Tomcat by running:
   ```cmd
   C:\apache-tomcat-9.0\bin\startup.bat
   ```
   Tomcat runs on port `8080`.

### Step 4: Open and Test the Application
1. In your browser, open:
   ```text
   http://localhost/skillswap/
   ```
2. You can log in using one of the pre-configured sample student accounts:
   - **Student 1:** Email: `rahul@college.edu` | Password: `123456`
   - **Student 2:** Email: `priya@college.edu` | Password: `123456`
   - **Student 3:** Email: `amit@college.edu` | Password: `123456`
3. Or click **Register here** to create a brand new account!

---

## 🧪 Security & Performance Testing

### 1. Security Testing with OWASP ZAP (Zed Attack Proxy)
1. Download and start **OWASP ZAP**.
2. In the "Automated Scan" box, enter the target URL:
   ```text
   http://localhost/skillswap/login.php
   ```
3. Click **Attack**.
4. **Key Security Controls Implemented:**
   - **SQL Injection Prevention:** Every query in both PHP (`PDO::prepare`) and Java Servlets (`PreparedStatement`) uses parameter substitution (`?`), eliminating SQL injection risks.
   - **XSS (Cross-Site Scripting) Defense:** All user inputs echoed on pages are filtered through `htmlspecialchars()`.
   - **Password Security:** Passwords are never stored in plain text; they are hashed using PHP's standard `password_hash()` algorithm.

### 2. Performance Testing with Google Lighthouse
1. Open Google Chrome and visit `http://localhost/skillswap/`.
2. Press `F12` (or right-click and choose **Inspect**) to open Chrome DevTools.
3. Switch to the **Lighthouse** tab.
4. Select **Desktop** and check **Performance**, **Accessibility**, **Best Practices**, and **SEO**.
5. Click **Analyze page load**.
6. **Expected Results:**
   - Score **95+** across all categories due to lightweight structure, zero heavy JavaScript frameworks, and minified CDN assets.
"# skillswap" 
