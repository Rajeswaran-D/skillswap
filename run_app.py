"""
SkillSwap – Student Skill Exchange Platform
Standalone Local Runner (Zero Dependencies)
Runs with Python 3 built-in modules: http.server, sqlite3, hashlib
"""

import http.server
import socketserver
import urllib.parse
import sqlite3
import hashlib
import os
import sys
import json
from http import cookies

PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "skillswap_local.db")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Exactly 3 tables: students, skills, requests
    c.execute("""
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        department TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        skill_name TEXT NOT NULL,
        skill_type TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        skill_id INTEGER NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );
    """)

    # Seed sample accounts if empty
    c.execute("SELECT COUNT(*) FROM students")
    if c.fetchone()[0] == 0:
        pwd_hash = hashlib.sha256("123456".encode("utf-8")).hexdigest()
        c.execute("INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)",
                  ("Rahul Sharma", "rahul@college.edu", pwd_hash, "Computer Science"))
        c.execute("INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)",
                  ("Priya Patel", "priya@college.edu", pwd_hash, "Information Tech"))
        c.execute("INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)",
                  ("Amit Verma", "amit@college.edu", pwd_hash, "Electronics"))

        c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                  (1, "Python Programming", "TEACH", "Can teach basic Python, functions and loops"))
        c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                  (1, "UI/UX Design", "LEARN", "Want to learn Figma and wireframing"))
        c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                  (2, "UI/UX Design (Figma)", "TEACH", "Can teach design fundamentals in Figma"))
        c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                  (2, "Java Servlets", "LEARN", "Want to learn Java web development"))
        c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                  (3, "Arduino & IoT", "TEACH", "Can teach Arduino coding and circuit sensors"))

        c.execute("INSERT INTO requests (sender_id, receiver_id, skill_id, message, status) VALUES (?, ?, ?, ?, 'PENDING')",
                  (1, 2, 3, "Hi Priya, I want to learn Figma from you. I can teach Python in return!"))

    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

sessions = {}

class SkillSwapHandler(http.server.BaseHTTPRequestHandler):

    def get_current_user(self):
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            c = cookies.SimpleCookie(cookie_header)
            if "session_id" in c:
                sid = c["session_id"].value
                return sessions.get(sid)
        return None

    def set_session(self, user):
        sid = hashlib.md5(f"{user['id']}_{os.urandom(8)}".encode()).hexdigest()
        sessions[sid] = user
        return sid

    def clear_session(self):
        cookie_header = self.headers.get("Cookie")
        if cookie_header:
            c = cookies.SimpleCookie(cookie_header)
            if "session_id" in c:
                sid = c["session_id"].value
                if sid in sessions:
                    del sessions[sid]

    def redirect(self, location, set_cookie=None):
        self.send_response(303)
        self.send_header("Location", location)
        if set_cookie:
            self.send_header("Set-Cookie", f"session_id={set_cookie}; Path=/; HttpOnly")
        self.end_headers()

    def send_html(self, content):
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        user = self.get_current_user()

        if path == "/logout":
            self.clear_session()
            self.redirect("/login?msg=logged_out")
            return

        if path in ["/login", "/"]:
            if user:
                self.redirect("/dashboard")
                return
            msg = query.get("msg", [""])[0]
            err = query.get("error", [""])[0]
            self.render_login(msg, err)
            return

        if path == "/register":
            if user:
                self.redirect("/dashboard")
                return
            msg = query.get("msg", [""])[0]
            err = query.get("error", [""])[0]
            self.render_register(msg, err)
            return

        if path == "/dashboard":
            if not user:
                self.redirect("/login")
                return
            msg = query.get("msg", [""])[0]
            self.render_dashboard(user, msg)
            return

        # Fallback to login
        self.redirect("/login")

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(length).decode("utf-8")
        params = urllib.parse.parse_qs(post_data)

        user = self.get_current_user()

        if path == "/login":
            email = params.get("email", [""])[0].strip()
            password = params.get("password", [""])[0].strip()
            pwd_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()

            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT * FROM students WHERE email = ? AND password = ?", (email, pwd_hash))
            student = c.fetchone()
            conn.close()

            if student:
                sid = self.set_session(dict(student))
                self.redirect("/dashboard", set_cookie=sid)
            else:
                self.redirect("/login?error=Invalid email or password")
            return

        if path == "/register":
            name = params.get("name", [""])[0].strip()
            email = params.get("email", [""])[0].strip()
            password = params.get("password", [""])[0].strip()
            dept = params.get("department", [""])[0].strip()

            if not name or not email or not password or not dept:
                self.redirect("/register?error=All fields are required")
                return

            pwd_hash = hashlib.sha256(password.encode("utf-8")).hexdigest()
            conn = get_db()
            c = conn.cursor()
            try:
                c.execute("INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)",
                          (name, email, pwd_hash, dept))
                conn.commit()
                conn.close()
                self.redirect("/login?msg=registered")
            except sqlite3.IntegrityError:
                conn.close()
                self.redirect("/register?error=Email is already registered")
            return

        # Protected POST endpoints
        if not user:
            self.redirect("/login")
            return

        # Module 2: Add Skill (Simulating Servlet)
        if path == "/add-skill":
            skill_name = params.get("skill_name", [""])[0].strip()
            skill_type = params.get("skill_type", ["TEACH"])[0].strip().upper()
            description = params.get("description", [""])[0].strip()

            if skill_name:
                conn = get_db()
                c = conn.cursor()
                c.execute("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)",
                          (user["id"], skill_name, skill_type, description))
                conn.commit()
                conn.close()
                self.redirect("/dashboard?msg=skill_added")
            else:
                self.redirect("/dashboard?error=Skill name is required")
            return

        # Module 3: Process Request (Simulating Servlet)
        if path == "/process-request":
            action = params.get("action", [""])[0].strip()

            if action == "send":
                receiver_id = int(params.get("receiver_id", [0])[0])
                skill_id = int(params.get("skill_id", [0])[0])
                message = params.get("message", [""])[0].strip()

                conn = get_db()
                c = conn.cursor()
                c.execute("INSERT INTO requests (sender_id, receiver_id, skill_id, message, status) VALUES (?, ?, ?, ?, 'PENDING')",
                          (user["id"], receiver_id, skill_id, message))
                conn.commit()
                conn.close()
                self.redirect("/dashboard?msg=request_sent")
                return

            elif action == "accept":
                request_id = int(params.get("request_id", [0])[0])
                conn = get_db()
                c = conn.cursor()
                c.execute("UPDATE requests SET status = 'ACCEPTED' WHERE id = ? AND receiver_id = ?",
                          (request_id, user["id"]))
                conn.commit()
                conn.close()
                self.redirect("/dashboard?msg=request_accepted")
                return

            elif action == "reject":
                request_id = int(params.get("request_id", [0])[0])
                conn = get_db()
                c = conn.cursor()
                c.execute("UPDATE requests SET status = 'REJECTED' WHERE id = ? AND receiver_id = ?",
                          (request_id, user["id"]))
                conn.commit()
                conn.close()
                self.redirect("/dashboard?msg=request_rejected")
                return

        self.redirect("/dashboard")

    # HTML Views
    def render_login(self, msg, err):
        alert = ""
        if msg == "registered":
            alert = '<div class="alert alert-success py-2">Registration successful! Please login.</div>'
        elif msg == "logged_out":
            alert = '<div class="alert alert-info py-2">You have logged out safely.</div>'
        if err:
            alert = f'<div class="alert alert-danger py-2">{err}</div>'

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login – SkillSwap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-body p-4">
                    <h3 class="text-center fw-bold text-primary mb-1">SkillSwap</h3>
                    <p class="text-center text-muted small mb-4">Student Skill Exchange Platform</p>
                    {alert}
                    <form action="/login" method="POST">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">College Email</label>
                            <input type="email" name="email" class="form-control" value="rahul@college.edu" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Password</label>
                            <input type="password" name="password" class="form-control" value="123456" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Sign In</button>
                    </form>
                    <p class="text-center mt-3 mb-0 small text-muted">
                        Don't have an account? <a href="/register">Register here</a>
                    </p>
                    <div class="mt-4 p-2 bg-light border rounded small text-secondary">
                        <strong>Demo Accounts (password: 123456):</strong><br>
                        <code>rahul@college.edu</code> &bull; <code>priya@college.edu</code> &bull; <code>amit@college.edu</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""
        self.send_html(html)

    def render_register(self, msg, err):
        alert = f'<div class="alert alert-danger py-2">{err}</div>' if err else ""
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Register – SkillSwap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-body p-4">
                    <h3 class="text-center fw-bold text-primary mb-1">SkillSwap</h3>
                    <p class="text-center text-muted small mb-4">Student Registration</p>
                    {alert}
                    <form action="/register" method="POST">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Full Name</label>
                            <input type="text" name="name" class="form-control" required placeholder="e.g. Sneha Reddy">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">College Email</label>
                            <input type="email" name="email" class="form-control" required placeholder="e.g. sneha@college.edu">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Department</label>
                            <input type="text" name="department" class="form-control" required placeholder="e.g. Computer Science">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Password</label>
                            <input type="password" name="password" class="form-control" minlength="6" required placeholder="Min 6 characters">
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Register</button>
                    </form>
                    <p class="text-center mt-3 mb-0 small text-muted">
                        Already have an account? <a href="/login">Login here</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>"""
        self.send_html(html)

    def render_dashboard(self, user, msg):
        conn = get_db()
        c = conn.cursor()

        # My skills
        c.execute("SELECT * FROM skills WHERE student_id = ? ORDER BY id DESC", (user["id"],))
        my_skills = c.fetchall()

        # Other skills
        c.execute("""
            SELECT s.*, st.name AS student_name, st.department, st.email 
            FROM skills s
            JOIN students st ON s.student_id = st.id
            WHERE s.student_id != ?
            ORDER BY s.id DESC
        """, (user["id"],))
        other_skills = c.fetchall()

        # Incoming requests
        c.execute("""
            SELECT r.*, st.name AS sender_name, st.email AS sender_email, s.skill_name
            FROM requests r
            JOIN students st ON r.sender_id = st.id
            JOIN skills s ON r.skill_id = s.id
            WHERE r.receiver_id = ?
            ORDER BY r.id DESC
        """, (user["id"],))
        incoming_requests = c.fetchall()

        # Outgoing requests
        c.execute("""
            SELECT r.*, st.name AS receiver_name, s.skill_name
            FROM requests r
            JOIN students st ON r.receiver_id = st.id
            JOIN skills s ON r.skill_id = s.id
            WHERE r.sender_id = ?
            ORDER BY r.id DESC
        """, (user["id"],))
        outgoing_requests = c.fetchall()
        conn.close()

        # Alerts
        alert = ""
        if msg == "skill_added":
            alert = '<div class="alert alert-success py-2">Skill added successfully!</div>'
        elif msg == "request_sent":
            alert = '<div class="alert alert-success py-2">Exchange request sent to partner!</div>'
        elif msg == "request_accepted":
            alert = '<div class="alert alert-success py-2">Exchange request accepted!</div>'
        elif msg == "request_rejected":
            alert = '<div class="alert alert-warning py-2">Exchange request rejected.</div>'

        # Render My Skills List
        my_skills_html = ""
        if not my_skills:
            my_skills_html = '<p class="text-muted text-center py-4 mb-0 small">No skills added yet.</p>'
        else:
            my_skills_html = '<ul class="list-group list-group-flush">'
            for s in my_skills:
                badge = 'bg-success' if s["skill_type"] == 'TEACH' else 'bg-info'
                badge_text = 'Can Teach' if s["skill_type"] == 'TEACH' else 'Want to Learn'
                my_skills_html += f"""
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-semibold">{s['skill_name']}</div>
                        <small class="text-muted">{s['description'] or ''}</small>
                    </div>
                    <span class="badge {badge}">{badge_text}</span>
                </li>"""
            my_skills_html += '</ul>'

        # Render Other Skills
        other_skills_html = ""
        if not other_skills:
            other_skills_html = '<p class="text-muted text-center py-4 mb-0 small">No other student skills available.</p>'
        else:
            other_skills_html = """
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Skill</th>
                            <th>Type</th>
                            <th>Student</th>
                            <th>Department</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>"""
            for s in other_skills:
                badge = 'bg-success' if s["skill_type"] == 'TEACH' else 'bg-info'
                badge_text = 'Teaching' if s["skill_type"] == 'TEACH' else 'Learning'
                other_skills_html += f"""
                <tr>
                    <td>
                        <div class="fw-bold">{s['skill_name']}</div>
                        <small class="text-muted">{s['description'] or ''}</small>
                    </td>
                    <td><span class="badge {badge}">{badge_text}</span></td>
                    <td>{s['student_name']}</td>
                    <td>{s['department']}</td>
                    <td class="text-end">
                        <form action="/process-request" method="POST" class="d-inline">
                            <input type="hidden" name="action" value="send">
                            <input type="hidden" name="receiver_id" value="{s['student_id']}">
                            <input type="hidden" name="skill_id" value="{s['id']}">
                            <input type="hidden" name="message" value="Hi! Let's connect and exchange skills.">
                            <button type="submit" class="btn btn-sm btn-outline-primary">Request Exchange</button>
                        </form>
                    </td>
                </tr>"""
            other_skills_html += "</tbody></table></div>"

        # Render Incoming
        incoming_html = ""
        if not incoming_requests:
            incoming_html = '<p class="text-muted text-center py-4 mb-0 small">No incoming requests yet.</p>'
        else:
            incoming_html = """
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>From</th>
                            <th>Skill</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th class="text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>"""
            for r in incoming_requests:
                st_badge = 'bg-warning text-dark' if r['status'] == 'PENDING' else ('bg-success' if r['status'] == 'ACCEPTED' else 'bg-danger')
                actions = ""
                if r['status'] == 'PENDING':
                    actions = f"""
                    <form action="/process-request" method="POST" class="d-inline">
                        <input type="hidden" name="action" value="accept">
                        <input type="hidden" name="request_id" value="{r['id']}">
                        <button type="submit" class="btn btn-sm btn-success">Accept</button>
                    </form>
                    <form action="/process-request" method="POST" class="d-inline">
                        <input type="hidden" name="action" value="reject">
                        <input type="hidden" name="request_id" value="{r['id']}">
                        <button type="submit" class="btn btn-sm btn-outline-danger">Reject</button>
                    </form>"""
                else:
                    actions = '<small class="text-muted">Completed</small>'

                incoming_html += f"""
                <tr>
                    <td>
                        <div class="fw-semibold">{r['sender_name']}</div>
                        <small class="text-muted">{r['sender_email']}</small>
                    </td>
                    <td><span class="badge bg-secondary">{r['skill_name']}</span></td>
                    <td><small class="text-muted">{r['message'] or ''}</small></td>
                    <td><span class="badge {st_badge}">{r['status']}</span></td>
                    <td class="text-end">{actions}</td>
                </tr>"""
            incoming_html += "</tbody></table></div>"

        # Render Outgoing
        outgoing_html = ""
        if not outgoing_requests:
            outgoing_html = '<p class="text-muted text-center py-4 mb-0 small">No requests sent yet.</p>'
        else:
            outgoing_html = """
            <div class="table-responsive">
                <table class="table align-middle mb-0">
                    <thead class="table-light">
                        <tr>
                            <th>Sent To</th>
                            <th>Skill</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>"""
            for r in outgoing_requests:
                st_badge = 'bg-warning text-dark' if r['status'] == 'PENDING' else ('bg-success' if r['status'] == 'ACCEPTED' else 'bg-danger')
                outgoing_html += f"""
                <tr>
                    <td>{r['receiver_name']}</td>
                    <td><span class="badge bg-secondary">{r['skill_name']}</span></td>
                    <td><span class="badge {st_badge}">{r['status']}</span></td>
                </tr>"""
            outgoing_html += "</tbody></table></div>"

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>SkillSwap Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
        <a class="navbar-brand fw-bold" href="/dashboard">SkillSwap</a>
        <div class="d-flex align-items-center text-white">
            <span class="me-3 small">Logged in as: <strong>{user['name']}</strong> ({user['department']})</span>
            <a href="/logout" class="btn btn-sm btn-outline-light">Logout</a>
        </div>
    </div>
</nav>

<div class="container my-4">
    {alert}
    <div class="row g-4">
        <!-- Add Skill Column -->
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Add a Skill</div>
                <div class="card-body">
                    <form action="/add-skill" method="POST">
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Skill Name</label>
                            <input type="text" name="skill_name" class="form-control" required placeholder="e.g. Python, Java, Graphic Design">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Skill Type</label>
                            <select name="skill_type" class="form-select" required>
                                <option value="TEACH">I can TEACH this skill</option>
                                <option value="LEARN">I want to LEARN this skill</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-semibold">Short Description</label>
                            <textarea name="description" class="form-control" rows="2" placeholder="Briefly describe what you know or want to learn..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Submit Skill</button>
                    </form>
                </div>
            </div>

            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-header bg-white fw-bold py-3">My Skills</div>
                <div class="card-body p-0">
                    {my_skills_html}
                </div>
            </div>
        </div>

        <!-- Exchange & Other Skills Column -->
        <div class="col-lg-8">
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Explore Skills From Other Students</div>
                <div class="card-body p-0">
                    {other_skills_html}
                </div>
            </div>

            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Incoming Exchange Proposals</div>
                <div class="card-body p-0">
                    {incoming_html}
                </div>
            </div>

            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-header bg-white fw-bold py-3">Requests You Sent</div>
                <div class="card-body p-0">
                    {outgoing_html}
                </div>
            </div>
        </div>
    </div>
</div>

<footer class="text-center py-4 text-muted small mt-4">
    SkillSwap – Student Skill Exchange Platform &copy; 2026 | Built for Web Technologies Lab
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>"""
        self.send_html(html)

if __name__ == "__main__":
    init_db()
    print(f"SkillSwap Server starting on http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), SkillSwapHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
