# SkillSwap – Student Skill Exchange Platform

A simple, beginner-friendly peer-to-peer web application that enables college students to share skills they know and find peers who can teach skills they want to learn.

> **✨ GitHub Pages Ready:** This project now includes a **100% serverless, client-side static web edition** (`index.html`) that can be hosted directly on **GitHub Pages** with zero setup, zero database configuration, and zero server requirements!

---

## 🌐 Live GitHub Pages Deployment Guide (In 30 Seconds)

You can host this entire project completely free on GitHub Pages:

### Step 1: Push your code to GitHub
If you haven't pushed the latest changes yet, run in your terminal:
```bash
git add .
git commit -m "Enable GitHub Pages static hosting"
git push origin main
```

### Step 2: Enable GitHub Pages in your Repository Settings
1. Open your repository on GitHub: `https://github.com/Rajeswaran-D/skillswap`
2. Click **Settings** (tab at the top right of the repository).
3. In the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment**:
   - **Source:** Select `Deploy from a branch`
   - **Branch:** Select `main`
   - **Folder:** Select `/ (root)`
5. Click **Save**.

### Step 3: Access your Live App!
In about 1 minute, GitHub will display your live site link:
```text
https://rajeswaran-d.github.io/skillswap/
```
Anyone visiting this link can immediately explore skills, register accounts, propose skill exchanges, and test the platform right from their web browser!

---

## 💻 Running Locally (Instant Zero-Config Mode)

You can run SkillSwap on your computer without installing Python, XAMPP, PHP, MySQL, or Tomcat:

- **Option 1:** Simply double-click [`start.bat`](file:///c:/Users/gmh08/OneDrive/Pictures/Desktop/wt/start.bat)
- **Option 2:** Open [`index.html`](file:///c:/Users/gmh08/OneDrive/Pictures/Desktop/wt/index.html) directly in any web browser (Chrome, Edge, Firefox, Safari).

### Built-in Demo Accounts (1-Click Login)
The static version comes pre-seeded in browser `localStorage` with sample student accounts:
- **Rahul Sharma** (`rahul@college.edu`) – *Computer Science* (Teaches Python, wants to learn UI/UX)
- **Priya Patel** (`priya@college.edu`) – *Information Tech* (Teaches UI/UX Figma, wants to learn Java Servlets)
- **Amit Verma** (`amit@college.edu`) – *Electronics* (Teaches Arduino & IoT)
- *Default password for all sample accounts:* `123456`
- **Quick Switch:** Use the dropdown in the top navigation bar to switch between students instantly without re-typing passwords!
- **Reset Button:** Click the **Reset Demo** button anytime to restore the default sample dataset.

---

## 📂 Project Structure

```text
wt/
├── index.html                       # Entry point for GitHub Pages & static hosting
├── css/
│   └── style.css                   # Modern styling & responsive card layouts
├── js/
│   └── app.js                      # Core frontend logic & LocalStorage DB layer
├── start.bat                       # One-click instant browser launcher
│
├── database/                       # [Optional] MySQL database schema for lab evaluations
│   └── skillswap.sql               # MySQL tables schema and sample records
├── php/                            # [Optional] Traditional PHP backend files
│   ├── config.php                  # PDO database connection
│   ├── index.php                   # PHP dashboard view
│   ├── login.php                   # PHP auth login
│   ├── register.php                # PHP auth registration
│   └── logout.php                  # PHP session termination
├── servlets/                       # [Optional] Apache Tomcat Java Servlet backend
│   ├── src/
│   │   ├── AddSkillServlet.java    # Module 2: Add skill via JDBC
│   │   └── ProcessRequestServlet.java # Module 3: Request exchange processing
│   ├── WEB-INF/
│   │   └── web.xml                 # Servlet deployment descriptor
│   └── compile.bat                 # Servlet compilation script
├── run_app.py                      # [Optional] Local standalone Python server
└── README.md                       # Documentation & deployment guide
```

---

## 🌟 Features Implemented

### Module 1: Student Authentication & Profiles
- Student registration with full name, college email, department, and password.
- Secure login and session handling.
- Instant 1-click test student switcher in the navigation bar.

### Module 2: Skill Management
- Add skills with categorized intent:
  - 🟢 **TEACH:** Skills the student can share and teach.
  - 🔵 **LEARN:** Skills the student is actively seeking to learn.
- Detailed descriptions for each skill.
- "My Skills" management view with quick deletion.

### Module 3: Skill Discovery & Exchange Proposals
- **Live Search & Filter:** Instant real-time search across skill titles, descriptions, student names, and departments.
- **Filter Pills:** Switch between "All", "Can Teach", and "Want to Learn".
- **Exchange Proposal System:** Propose a skill exchange with a custom message.
- **Incoming Proposals Center:** Accept or Reject proposals from fellow peers.
- **Outgoing Status Tracker:** Real-time visibility into whether requests are `PENDING`, `ACCEPTED`, or `REJECTED`.
- **Contact Reveal:** Once a proposal is accepted, students can immediately see each other's college emails to connect.

---

## 🔬 Optional: Traditional College Lab Setup (PHP + Tomcat + MySQL)

If your college professor requires evaluating the original PHP + Tomcat + MySQL multi-tier architecture:

### 1. Database (MySQL via XAMPP)
1. Start **Apache** and **MySQL** in XAMPP.
2. Open `http://localhost/phpmyadmin/` and import [`database/skillswap.sql`](file:///c:/Users/gmh08/OneDrive/Pictures/Desktop/wt/database/skillswap.sql).

### 2. PHP Frontend (XAMPP htdocs)
1. Copy the `php` folder to `C:\xampp\htdocs\skillswap\`.
2. Visit `http://localhost/skillswap/`.

### 3. Java Servlets (Apache Tomcat)
1. Copy `servlets` folder to `C:\apache-tomcat-9.0\webapps\skillswap-servlets\`.
2. Compile servlets using `compile.bat` or `javac`.
3. Start Tomcat on port `8080`.

---

## 🧪 Security & Quality Controls
- **Client-Side Sanitization:** All user inputs are safely escaped (`escapeHTML`) preventing Cross-Site Scripting (XSS).
- **Relational Integrity:** Cascading updates and deletion of associated exchange proposals when a skill is removed.
- **Responsive Layout:** Built with Bootstrap 5 mobile-first grid, completely usable on phones, tablets, and desktop computers.
