/**
 * SkillSwap – Student Skill Exchange Platform
 * Client-Side Application Core (GitHub Pages Static Edition)
 * Zero dependencies, pure vanilla JS + Bootstrap 5 + localStorage persistence
 */

// ========================================================
// 1. DATABASE & STORAGE LAYER (LocalStorage)
// ========================================================

const STORAGE_KEYS = {
    STUDENTS: "skillswap_students",
    SKILLS: "skillswap_skills",
    REQUESTS: "skillswap_requests",
    ACTIVE_USER_ID: "skillswap_active_user_id"
};

const DEFAULT_DATA = {
    students: [
        {
            id: 1,
            name: "Rahul Sharma",
            email: "rahul@college.edu",
            password: "123456",
            department: "Computer Science",
            created_at: "2026-10-30 19:00:00"
        },
        {
            id: 2,
            name: "Priya Patel",
            email: "priya@college.edu",
            password: "123456",
            department: "Information Tech",
            created_at: "2026-10-30 19:05:00"
        },
        {
            id: 3,
            name: "Amit Verma",
            email: "amit@college.edu",
            password: "123456",
            department: "Electronics",
            created_at: "2026-10-30 19:10:00"
        }
    ],
    skills: [
        {
            id: 1,
            student_id: 1,
            skill_name: "Python Programming",
            skill_type: "TEACH",
            description: "Can teach basic Python, functions, OOP and loops",
            created_at: "2026-10-30 19:15:00"
        },
        {
            id: 2,
            student_id: 1,
            skill_name: "UI/UX Design",
            skill_type: "LEARN",
            description: "Want to learn Figma, wireframing and user research",
            created_at: "2026-10-30 19:16:00"
        },
        {
            id: 3,
            student_id: 2,
            skill_name: "UI/UX Design (Figma)",
            skill_type: "TEACH",
            description: "Can teach design fundamentals, auto-layout and components in Figma",
            created_at: "2026-10-30 19:20:00"
        },
        {
            id: 4,
            student_id: 2,
            skill_name: "Java Servlets",
            skill_type: "LEARN",
            description: "Want to learn Java web development with Tomcat and JDBC",
            created_at: "2026-10-30 19:22:00"
        },
        {
            id: 5,
            student_id: 3,
            skill_name: "Arduino & IoT",
            skill_type: "TEACH",
            description: "Can teach Arduino C++ coding, circuit sensors and hardware integration",
            created_at: "2026-10-30 19:25:00"
        }
    ],
    requests: [
        {
            id: 1,
            sender_id: 1,
            receiver_id: 2,
            skill_id: 3,
            message: "Hi Priya! I saw you teach Figma. I can teach you Python in return. Let's connect!",
            status: "PENDING",
            created_at: "2026-10-30 19:30:00"
        }
    ]
};

const SkillSwapDB = {
    init(forceReset = false) {
        if (forceReset || !localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
            localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_DATA.students));
            localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(DEFAULT_DATA.skills));
            localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(DEFAULT_DATA.requests));
            if (forceReset) {
                localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, "1");
            }
        }
    },

    // Students
    getStudents() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || "[]");
    },

    getStudentById(id) {
        return this.getStudents().find(s => s.id === Number(id)) || null;
    },

    getStudentByEmail(email) {
        return this.getStudents().find(s => s.email.toLowerCase() === email.toLowerCase().trim()) || null;
    },

    addStudent({ name, email, department, password }) {
        const students = this.getStudents();
        const nextId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        const newStudent = {
            id: nextId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password: password,
            department: department.trim(),
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        students.push(newStudent);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        return newStudent;
    },

    // Skills
    getSkills() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SKILLS) || "[]");
    },

    getSkillsByStudent(studentId) {
        return this.getSkills().filter(s => s.student_id === Number(studentId));
    },

    getOtherSkills(studentId) {
        const sid = Number(studentId);
        const students = this.getStudents();
        const studentMap = {};
        students.forEach(s => { studentMap[s.id] = s; });

        return this.getSkills()
            .filter(s => s.student_id !== sid)
            .map(s => ({
                ...s,
                student_name: studentMap[s.student_id]?.name || "Unknown",
                department: studentMap[s.student_id]?.department || "General",
                student_email: studentMap[s.student_id]?.email || ""
            }));
    },

    addSkill({ student_id, skill_name, skill_type, description }) {
        const skills = this.getSkills();
        const nextId = skills.length > 0 ? Math.max(...skills.map(s => s.id)) + 1 : 1;
        const newSkill = {
            id: nextId,
            student_id: Number(student_id),
            skill_name: skill_name.trim(),
            skill_type: skill_type,
            description: (description || "").trim(),
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        skills.unshift(newSkill);
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));
        return newSkill;
    },

    deleteSkill(skillId, studentId) {
        let skills = this.getSkills();
        skills = skills.filter(s => !(s.id === Number(skillId) && s.student_id === Number(studentId)));
        localStorage.setItem(STORAGE_KEYS.SKILLS, JSON.stringify(skills));

        // Cascade delete requests involving this skill
        let requests = this.getRequests();
        requests = requests.filter(r => r.skill_id !== Number(skillId));
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    },

    // Requests
    getRequests() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || "[]");
    },

    getIncomingRequests(receiverId) {
        const rid = Number(receiverId);
        const students = this.getStudents();
        const skills = this.getSkills();
        const studentMap = {};
        const skillMap = {};
        students.forEach(s => { studentMap[s.id] = s; });
        skills.forEach(sk => { skillMap[sk.id] = sk; });

        return this.getRequests()
            .filter(r => r.receiver_id === rid)
            .map(r => ({
                ...r,
                sender_name: studentMap[r.sender_id]?.name || "Unknown",
                sender_email: studentMap[r.sender_id]?.email || "",
                sender_dept: studentMap[r.sender_id]?.department || "",
                skill_name: skillMap[r.skill_id]?.skill_name || "Skill #" + r.skill_id
            }))
            .reverse();
    },

    getOutgoingRequests(senderId) {
        const sid = Number(senderId);
        const students = this.getStudents();
        const skills = this.getSkills();
        const studentMap = {};
        const skillMap = {};
        students.forEach(s => { studentMap[s.id] = s; });
        skills.forEach(sk => { skillMap[sk.id] = sk; });

        return this.getRequests()
            .filter(r => r.sender_id === sid)
            .map(r => ({
                ...r,
                receiver_name: studentMap[r.receiver_id]?.name || "Unknown",
                receiver_email: studentMap[r.receiver_id]?.email || "",
                receiver_dept: studentMap[r.receiver_id]?.department || "",
                skill_name: skillMap[r.skill_id]?.skill_name || "Skill #" + r.skill_id
            }))
            .reverse();
    },

    addRequest({ sender_id, receiver_id, skill_id, message }) {
        const requests = this.getRequests();

        // Check if an existing pending request already exists for this pair & skill
        const existing = requests.find(r =>
            r.sender_id === Number(sender_id) &&
            r.receiver_id === Number(receiver_id) &&
            r.skill_id === Number(skill_id) &&
            r.status === "PENDING"
        );
        if (existing) {
            throw new Error("You already have a pending exchange request for this skill.");
        }

        const nextId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
        const newReq = {
            id: nextId,
            sender_id: Number(sender_id),
            receiver_id: Number(receiver_id),
            skill_id: Number(skill_id),
            message: (message || "Hi! Let's connect and exchange skills.").trim(),
            status: "PENDING",
            created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
        requests.push(newReq);
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
        return newReq;
    },

    updateRequestStatus(requestId, newStatus, currentStudentId) {
        const requests = this.getRequests();
        const req = requests.find(r => r.id === Number(requestId));
        if (!req) throw new Error("Request not found.");
        if (req.receiver_id !== Number(currentStudentId)) {
            throw new Error("Unauthorized: Only the receiver can accept or reject this request.");
        }
        req.status = newStatus;
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
        return req;
    },

    cancelOutgoingRequest(requestId, currentStudentId) {
        let requests = this.getRequests();
        requests = requests.filter(r => !(r.id === Number(requestId) && r.sender_id === Number(currentStudentId)));
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    }
};

// ========================================================
// 2. AUTHENTICATION & SESSION MANAGER
// ========================================================

const SkillSwapAuth = {
    getActiveUser() {
        const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
        if (!id) return null;
        return SkillSwapDB.getStudentById(id);
    },

    login(email, password) {
        const student = SkillSwapDB.getStudentByEmail(email);
        if (!student) {
            throw new Error("No account found with this email.");
        }
        if (student.password !== password) {
            throw new Error("Incorrect password. (Default is 123456)");
        }
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, String(student.id));
        return student;
    },

    quickLogin(studentId) {
        const student = SkillSwapDB.getStudentById(studentId);
        if (!student) throw new Error("Student not found.");
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, String(student.id));
        return student;
    },

    register({ name, email, department, password }) {
        if (SkillSwapDB.getStudentByEmail(email)) {
            throw new Error("This email is already registered.");
        }
        const student = SkillSwapDB.addStudent({ name, email, department, password });
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, String(student.id));
        return student;
    },

    logout() {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
    }
};

// ========================================================
// 3. UI RENDERING & EVENT CONTROLLER
// ========================================================

let currentSkillFilter = "ALL";
let searchQuery = "";
let selectedSkillForExchange = null;

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message, type = "success") {
    const toastEl = document.getElementById("actionToast");
    const toastBody = document.getElementById("actionToastBody");
    const toastHeader = document.getElementById("actionToastHeader");
    const toastTitle = document.getElementById("actionToastTitle");

    toastEl.className = `toast align-items-center text-white border-0 ${
        type === "success" ? "bg-success" : type === "danger" ? "bg-danger" : "bg-primary"
    }`;
    toastTitle.textContent = type === "success" ? "Success" : type === "danger" ? "Notice" : "Information";
    toastBody.textContent = message;

    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
}

function renderApp() {
    const currentUser = SkillSwapAuth.getActiveUser();
    const loggedOutSection = document.getElementById("loggedOutSection");
    const loggedInSection = document.getElementById("loggedInSection");
    const navUserArea = document.getElementById("navUserArea");
    const navAuthButtons = document.getElementById("navAuthButtons");

    if (!currentUser) {
        // Show landing / auth page
        loggedOutSection.classList.remove("d-none");
        loggedInSection.classList.add("d-none");
        navUserArea.classList.add("d-none");
        navAuthButtons.classList.remove("d-none");
        renderPublicShowcase();
        return;
    }

    // Show dashboard
    loggedOutSection.classList.add("d-none");
    loggedInSection.classList.remove("d-none");
    navUserArea.classList.remove("d-none");
    navAuthButtons.classList.add("d-none");

    // Populate user info in Navbar
    document.getElementById("currentUserName").textContent = currentUser.name;
    document.getElementById("currentUserDept").textContent = currentUser.department;

    // Populate switch student menu
    renderSwitchStudentDropdown(currentUser.id);

    // Render dashboard components
    renderStats(currentUser.id);
    renderMySkills(currentUser.id);
    renderExploreSkills(currentUser.id);
    renderIncomingRequests(currentUser.id);
    renderOutgoingRequests(currentUser.id);
}

function renderSwitchStudentDropdown(currentId) {
    const container = document.getElementById("switchStudentMenu");
    const students = SkillSwapDB.getStudents();
    container.innerHTML = students.map(s => `
        <li>
            <button class="dropdown-item ${s.id === currentId ? 'active fw-bold' : ''}" onclick="handleQuickLogin(${s.id})">
                <i class="bi bi-person me-2"></i> ${escapeHTML(s.name)} 
                <small class="text-muted d-block ms-4">${escapeHTML(s.department)}</small>
            </button>
        </li>
    `).join("") + `
        <li><hr class="dropdown-divider"></li>
        <li>
            <button class="dropdown-item text-danger" onclick="confirmResetData()">
                <i class="bi bi-arrow-counterclockwise me-2"></i> Reset Demo Database
            </button>
        </li>
    `;
}

function renderStats(userId) {
    const mySkills = SkillSwapDB.getSkillsByStudent(userId);
    const teachCount = mySkills.filter(s => s.skill_type === "TEACH").length;
    const learnCount = mySkills.filter(s => s.skill_type === "LEARN").length;
    const incomingPending = SkillSwapDB.getIncomingRequests(userId).filter(r => r.status === "PENDING").length;
    const outgoingCount = SkillSwapDB.getOutgoingRequests(userId).length;

    document.getElementById("statTeachCount").textContent = teachCount;
    document.getElementById("statLearnCount").textContent = learnCount;
    document.getElementById("statIncomingCount").textContent = incomingPending;
    document.getElementById("statOutgoingCount").textContent = outgoingCount;
}

function renderMySkills(userId) {
    const skills = SkillSwapDB.getSkillsByStudent(userId);
    const container = document.getElementById("mySkillsList");
    const countBadge = document.getElementById("mySkillsCount");

    countBadge.textContent = skills.length;

    if (skills.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-journal-plus"></i>
                <p class="mb-0">You haven't listed any skills yet.</p>
                <small class="text-muted">Use the form above to add what you can teach or want to learn!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <ul class="list-group list-group-flush">
            ${skills.map(s => `
                <li class="list-group-item d-flex justify-content-between align-items-start py-3">
                    <div class="me-auto">
                        <div class="fw-bold">${escapeHTML(s.skill_name)}</div>
                        <small class="text-muted">${escapeHTML(s.description || "No description provided.")}</small>
                        <div class="mt-1">
                            <span class="badge ${s.skill_type === 'TEACH' ? 'badge-teach' : 'badge-learn'}">
                                <i class="bi ${s.skill_type === 'TEACH' ? 'bi-mortarboard-fill' : 'bi-lightbulb-fill'} me-1"></i>
                                ${s.skill_type === 'TEACH' ? 'Can Teach' : 'Want to Learn'}
                            </span>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger ms-2" title="Delete Skill" onclick="handleDeleteSkill(${s.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </li>
            `).join("")}
        </ul>
    `;
}

function renderExploreSkills(userId) {
    const otherSkills = SkillSwapDB.getOtherSkills(userId);
    const container = document.getElementById("exploreSkillsContainer");

    // Filter by type
    let filtered = otherSkills;
    if (currentSkillFilter === "TEACH") {
        filtered = filtered.filter(s => s.skill_type === "TEACH");
    } else if (currentSkillFilter === "LEARN") {
        filtered = filtered.filter(s => s.skill_type === "LEARN");
    }

    // Filter by search query
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(s =>
            s.skill_name.toLowerCase().includes(q) ||
            (s.description && s.description.toLowerCase().includes(q)) ||
            s.student_name.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-search"></i>
                <p class="mb-0">No matching skills found.</p>
                <small class="text-muted">Try a different search query or clear your filter.</small>
            </div>
        `;
        return;
    }

    // Check my outgoing requests to show status on skills
    const outgoingRequests = SkillSwapDB.getOutgoingRequests(userId);
    const requestedSkillIds = new Set(outgoingRequests.filter(r => r.status === "PENDING").map(r => r.skill_id));

    container.innerHTML = `
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
                <tbody>
                    ${filtered.map(s => {
                        const isPending = requestedSkillIds.has(s.id);
                        return `
                        <tr>
                            <td>
                                <div class="fw-bold">${escapeHTML(s.skill_name)}</div>
                                <small class="text-muted">${escapeHTML(s.description || "No description")}</small>
                            </td>
                            <td>
                                <span class="badge ${s.skill_type === 'TEACH' ? 'badge-teach' : 'badge-learn'}">
                                    ${s.skill_type === 'TEACH' ? 'Teaching' : 'Learning'}
                                </span>
                            </td>
                            <td>
                                <div class="fw-semibold">${escapeHTML(s.student_name)}</div>
                            </td>
                            <td><span class="badge bg-light text-secondary border">${escapeHTML(s.department)}</span></td>
                            <td class="text-end">
                                ${isPending ? `
                                    <span class="badge badge-pending py-2 px-3">
                                        <i class="bi bi-hourglass-split me-1"></i> Requested
                                    </span>
                                ` : `
                                    <button class="btn btn-sm btn-outline-primary" onclick="openExchangeModal(${s.id})">
                                        <i class="bi bi-arrow-left-right me-1"></i> Request
                                    </button>
                                `}
                            </td>
                        </tr>
                        `;
                    }).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderIncomingRequests(userId) {
    const incoming = SkillSwapDB.getIncomingRequests(userId);
    const container = document.getElementById("incomingRequestsContainer");
    const countBadge = document.getElementById("incomingCountBadge");

    const pendingCount = incoming.filter(r => r.status === "PENDING").length;
    countBadge.textContent = pendingCount;
    countBadge.className = pendingCount > 0 ? "badge bg-danger ms-2" : "badge bg-secondary ms-2";

    if (incoming.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-inbox"></i>
                <p class="mb-0">No incoming exchange requests yet.</p>
                <small class="text-muted">When other students request your skills, they will appear here!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>From</th>
                        <th>Target Skill</th>
                        <th>Proposal Note</th>
                        <th>Status</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${incoming.map(req => `
                        <tr>
                            <td>
                                <div class="fw-semibold">${escapeHTML(req.sender_name)}</div>
                                <small class="text-muted">${escapeHTML(req.sender_email)} • ${escapeHTML(req.sender_dept)}</small>
                            </td>
                            <td><span class="badge bg-secondary">${escapeHTML(req.skill_name)}</span></td>
                            <td><small class="text-secondary">${escapeHTML(req.message)}</small></td>
                            <td>
                                ${req.status === 'PENDING' ? '<span class="badge badge-pending">PENDING</span>' :
                                  req.status === 'ACCEPTED' ? '<span class="badge badge-accepted">ACCEPTED</span>' :
                                  '<span class="badge badge-rejected">REJECTED</span>'}
                            </td>
                            <td class="text-end">
                                ${req.status === 'PENDING' ? `
                                    <button class="btn btn-sm btn-success me-1" onclick="handleRespondRequest(${req.id}, 'ACCEPTED')">
                                        <i class="bi bi-check-lg"></i> Accept
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="handleRespondRequest(${req.id}, 'REJECTED')">
                                        <i class="bi bi-x-lg"></i> Reject
                                    </button>
                                ` : req.status === 'ACCEPTED' ? `
                                    <a href="mailto:${escapeHTML(req.sender_email)}" class="btn btn-sm btn-outline-success">
                                        <i class="bi bi-envelope"></i> Connect
                                    </a>
                                ` : `
                                    <small class="text-muted">Declined</small>
                                `}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderOutgoingRequests(userId) {
    const outgoing = SkillSwapDB.getOutgoingRequests(userId);
    const container = document.getElementById("outgoingRequestsContainer");

    if (outgoing.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="bi bi-send"></i>
                <p class="mb-0">You haven't sent any exchange proposals yet.</p>
                <small class="text-muted">Explore skills from other students above and click 'Request' to initiate a swap!</small>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Sent To</th>
                        <th>Skill</th>
                        <th>Note</th>
                        <th>Status</th>
                        <th class="text-end">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${outgoing.map(req => `
                        <tr>
                            <td>
                                <div class="fw-semibold">${escapeHTML(req.receiver_name)}</div>
                                <small class="text-muted">${escapeHTML(req.receiver_dept)}</small>
                            </td>
                            <td><span class="badge bg-secondary">${escapeHTML(req.skill_name)}</span></td>
                            <td><small class="text-muted">${escapeHTML(req.message)}</small></td>
                            <td>
                                ${req.status === 'PENDING' ? '<span class="badge badge-pending">PENDING</span>' :
                                  req.status === 'ACCEPTED' ? '<span class="badge badge-accepted">ACCEPTED</span>' :
                                  '<span class="badge badge-rejected">REJECTED</span>'}
                            </td>
                            <td class="text-end">
                                ${req.status === 'PENDING' ? `
                                    <button class="btn btn-sm btn-outline-secondary" onclick="handleCancelRequest(${req.id})" title="Cancel proposal">
                                        Cancel
                                    </button>
                                ` : req.status === 'ACCEPTED' ? `
                                    <a href="mailto:${escapeHTML(req.receiver_email)}" class="btn btn-sm btn-success">
                                        <i class="bi bi-envelope-fill me-1"></i> Contact
                                    </a>
                                ` : `
                                    <small class="text-muted">—</small>
                                `}
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}

function renderPublicShowcase() {
    const skills = SkillSwapDB.getSkills();
    const students = SkillSwapDB.getStudents();
    const studentMap = {};
    students.forEach(s => { studentMap[s.id] = s; });

    const totalStudents = students.length;
    const totalTeach = skills.filter(s => s.skill_type === "TEACH").length;
    const totalLearn = skills.filter(s => s.skill_type === "LEARN").length;

    document.getElementById("publicStatStudents").textContent = totalStudents;
    document.getElementById("publicStatTeach").textContent = totalTeach;
    document.getElementById("publicStatLearn").textContent = totalLearn;

    const showcaseContainer = document.getElementById("publicSkillsShowcase");
    showcaseContainer.innerHTML = skills.slice(0, 6).map(s => {
        const student = studentMap[s.student_id] || { name: "Student", department: "College" };
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="badge ${s.skill_type === 'TEACH' ? 'badge-teach' : 'badge-learn'}">
                                ${s.skill_type === 'TEACH' ? 'Can Teach' : 'Wants to Learn'}
                            </span>
                            <small class="text-muted"><i class="bi bi-clock"></i> Active</small>
                        </div>
                        <h6 class="card-title fw-bold text-dark">${escapeHTML(s.skill_name)}</h6>
                        <p class="card-text text-muted small">${escapeHTML(s.description || "Available for peer skill exchange.")}</p>
                        <div class="border-top pt-2 mt-3 d-flex justify-content-between align-items-center">
                            <small class="fw-semibold text-primary"><i class="bi bi-person-fill"></i> ${escapeHTML(student.name)}</small>
                            <small class="badge bg-light text-secondary border">${escapeHTML(student.department)}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// ========================================================
// 4. ACTION HANDLERS
// ========================================================

function handleLoginSubmit(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");

    errorEl.classList.add("d-none");
    try {
        const user = SkillSwapAuth.login(email, password);
        showToast(`Welcome back, ${user.name}!`);
        renderApp();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
    }
}

function handleQuickLogin(studentId) {
    try {
        const user = SkillSwapAuth.quickLogin(studentId);
        showToast(`Switched account to ${user.name}`);
        renderApp();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const department = document.getElementById("regDept").value;
    const password = document.getElementById("regPassword").value;
    const errorEl = document.getElementById("regError");

    errorEl.classList.add("d-none");
    try {
        const user = SkillSwapAuth.register({ name, email, department, password });
        showToast(`Account created! Welcome to SkillSwap, ${user.name}!`);
        renderApp();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("d-none");
    }
}

function handleLogout() {
    SkillSwapAuth.logout();
    showToast("You have logged out successfully.", "info");
    renderApp();
}

function handleAddSkillSubmit(event) {
    event.preventDefault();
    const currentUser = SkillSwapAuth.getActiveUser();
    if (!currentUser) return;

    const nameInput = document.getElementById("skillNameInput");
    const typeInput = document.getElementById("skillTypeInput");
    const descInput = document.getElementById("skillDescInput");

    try {
        SkillSwapDB.addSkill({
            student_id: currentUser.id,
            skill_name: nameInput.value,
            skill_type: typeInput.value,
            description: descInput.value
        });

        // Reset form
        nameInput.value = "";
        descInput.value = "";

        showToast("Skill listed successfully on SkillSwap!");
        renderApp();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleDeleteSkill(skillId) {
    const currentUser = SkillSwapAuth.getActiveUser();
    if (!currentUser) return;

    if (confirm("Are you sure you want to delete this skill listing?")) {
        SkillSwapDB.deleteSkill(skillId, currentUser.id);
        showToast("Skill listing removed.", "info");
        renderApp();
    }
}

function openExchangeModal(skillId) {
    const skills = SkillSwapDB.getSkills();
    const skill = skills.find(s => s.id === Number(skillId));
    if (!skill) return;

    const student = SkillSwapDB.getStudentById(skill.student_id);
    selectedSkillForExchange = skill;

    document.getElementById("modalSkillName").textContent = skill.skill_name;
    document.getElementById("modalStudentName").textContent = student ? student.name : "Peer Student";
    document.getElementById("modalDepartment").textContent = student ? student.department : "";
    document.getElementById("exchangeMessage").value = `Hi ${student ? student.name.split(" ")[0] : "there"}, I'd love to connect and exchange skills with you!`;

    const modal = new bootstrap.Modal(document.getElementById("exchangeModal"));
    modal.show();
}

function handleSendExchangeRequest() {
    const currentUser = SkillSwapAuth.getActiveUser();
    if (!currentUser || !selectedSkillForExchange) return;

    const message = document.getElementById("exchangeMessage").value;
    try {
        SkillSwapDB.addRequest({
            sender_id: currentUser.id,
            receiver_id: selectedSkillForExchange.student_id,
            skill_id: selectedSkillForExchange.id,
            message: message
        });

        const modalEl = document.getElementById("exchangeModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

        showToast("Exchange proposal sent successfully!");
        renderApp();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleRespondRequest(requestId, status) {
    const currentUser = SkillSwapAuth.getActiveUser();
    if (!currentUser) return;

    try {
        SkillSwapDB.updateRequestStatus(requestId, status, currentUser.id);
        showToast(status === "ACCEPTED" ? "Proposal accepted! You can now connect." : "Proposal declined.");
        renderApp();
    } catch (err) {
        showToast(err.message, "danger");
    }
}

function handleCancelRequest(requestId) {
    const currentUser = SkillSwapAuth.getActiveUser();
    if (!currentUser) return;

    if (confirm("Cancel this outgoing proposal?")) {
        SkillSwapDB.cancelOutgoingRequest(requestId, currentUser.id);
        showToast("Exchange proposal cancelled.", "info");
        renderApp();
    }
}

function confirmResetData() {
    if (confirm("Reset the database to initial sample data (Rahul, Priya, Amit)? Any changes you made will be re-initialized.")) {
        SkillSwapDB.init(true);
        showToast("Database successfully restored to original demo state!");
        renderApp();
    }
}

// ========================================================
// 5. EVENT LISTENERS & INITIALIZATION
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize DB with default seed data
    SkillSwapDB.init(false);

    // If no user is logged in, default to Rahul for smooth instant demo
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, "1");
    }

    // 2. Set up search & filter listeners
    const searchInput = document.getElementById("skillSearchInput");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim();
            const currentUser = SkillSwapAuth.getActiveUser();
            if (currentUser) renderExploreSkills(currentUser.id);
        });
    }

    document.querySelectorAll(".filter-pill").forEach(pill => {
        pill.addEventListener("click", (e) => {
            document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
            e.currentTarget.classList.add("active");
            currentSkillFilter = e.currentTarget.getAttribute("data-filter");
            const currentUser = SkillSwapAuth.getActiveUser();
            if (currentUser) renderExploreSkills(currentUser.id);
        });
    });

    // 3. Render initial view
    renderApp();
});
