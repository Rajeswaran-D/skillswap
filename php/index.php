<?php
require_once "config.php";
check_login();

$student_id = $_SESSION["student_id"];
$student_name = $_SESSION["student_name"];
$student_dept = $_SESSION["student_dept"];

// Servlets vs Pure PHP Toggle:
// If running locally with Apache Tomcat, set $use_tomcat = true
// For online shared hosting (InfinityFree, cPanel, etc.) where Tomcat is not supported, set $use_tomcat = false
$use_tomcat = false; 
$add_skill_url = $use_tomcat ? "http://localhost:8080/skillswap-servlets/add-skill" : "add_skill.php";
$process_request_url = $use_tomcat ? "http://localhost:8080/skillswap-servlets/process-request" : "process_request.php";

// 1. Fetch skills added by the current logged-in student
$my_skills_stmt = $conn->prepare("SELECT * FROM skills WHERE student_id = ? ORDER BY id DESC");
$my_skills_stmt->execute([$student_id]);
$my_skills = $my_skills_stmt->fetchAll();

// 2. Fetch skills added by OTHER students to explore and request
$other_skills_stmt = $conn->prepare("
    SELECT s.*, st.name AS student_name, st.department, st.email 
    FROM skills s
    JOIN students st ON s.student_id = st.id
    WHERE s.student_id != ?
    ORDER BY s.id DESC
");
$other_skills_stmt->execute([$student_id]);
$other_skills = $other_skills_stmt->fetchAll();

// 3. Fetch incoming exchange requests for this student
$incoming_stmt = $conn->prepare("
    SELECT r.*, st.name AS sender_name, st.email AS sender_email, s.skill_name
    FROM requests r
    JOIN students st ON r.sender_id = st.id
    JOIN skills s ON r.skill_id = s.id
    WHERE r.receiver_id = ?
    ORDER BY r.id DESC
");
$incoming_stmt->execute([$student_id]);
$incoming_requests = $incoming_stmt->fetchAll();

// 4. Fetch outgoing exchange requests sent by this student
$outgoing_stmt = $conn->prepare("
    SELECT r.*, st.name AS receiver_name, s.skill_name
    FROM requests r
    JOIN students st ON r.receiver_id = st.id
    JOIN skills s ON r.skill_id = s.id
    WHERE r.sender_id = ?
    ORDER BY r.id DESC
");
$outgoing_stmt->execute([$student_id]);
$outgoing_requests = $outgoing_stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard – SkillSwap</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-light">

<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
    <div class="container">
        <a class="navbar-brand fw-bold" href="index.php">SkillSwap</a>
        <div class="d-flex align-items-center text-white">
            <span class="me-3 small">Welcome, <strong><?= htmlspecialchars($student_name) ?></strong> (<?= htmlspecialchars($student_dept) ?>)</span>
            <a href="logout.php" class="btn btn-sm btn-outline-light">Logout</a>
        </div>
    </div>
</nav>

<div class="container my-4">

    <!-- Flash Feedback Alerts (Redirected from Java Servlets) -->
    <?php if (isset($_GET['msg'])): ?>
        <?php if ($_GET['msg'] === 'skill_added'): ?>
            <div class="alert alert-success alert-dismissible fade show">Skill added successfully via Java Servlet!</div>
        <?php elseif ($_GET['msg'] === 'request_sent'): ?>
            <div class="alert alert-success alert-dismissible fade show">Exchange request sent successfully via Java Servlet!</div>
        <?php elseif ($_GET['msg'] === 'request_accepted'): ?>
            <div class="alert alert-success alert-dismissible fade show">Exchange request accepted!</div>
        <?php elseif ($_GET['msg'] === 'request_rejected'): ?>
            <div class="alert alert-warning alert-dismissible fade show">Exchange request rejected.</div>
        <?php endif; ?>
    <?php endif; ?>

    <?php if (isset($_GET['error'])): ?>
        <div class="alert alert-danger alert-dismissible fade show">Operation failed: <?= htmlspecialchars($_GET['error']) ?></div>
    <?php endif; ?>

    <div class="row g-4">
        <!-- ==========================================
             MODULE 2: ADD SKILL (Processed by Java Servlet)
             ========================================== -->
        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Add a Skill</div>
                <div class="card-body">
                    <!-- Form submits to Java Servlet or PHP handler depending on $use_tomcat -->
                    <form action="<?= $add_skill_url ?>" method="POST">
                        <input type="hidden" name="student_id" value="<?= $student_id ?>">

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

                        <button type="submit" class="btn btn-primary w-100">
                            Submit Skill (Java Servlet)
                        </button>
                    </form>
                </div>
            </div>

            <!-- Current Student's Listed Skills -->
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-header bg-white fw-bold py-3">My Skills (<?= count($my_skills) ?>)</div>
                <div class="card-body p-0">
                    <?php if (empty($my_skills)): ?>
                        <p class="text-muted text-center py-4 mb-0 small">You have not added any skills yet.</p>
                    <?php else: ?>
                        <ul class="list-group list-group-flush">
                            <?php foreach ($my_skills as $s): ?>
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <div class="fw-semibold"><?= htmlspecialchars($s['skill_name']) ?></div>
                                        <small class="text-muted"><?= htmlspecialchars($s['description']) ?></small>
                                    </div>
                                    <span class="badge <?= $s['skill_type'] === 'TEACH' ? 'bg-success' : 'bg-info' ?>">
                                        <?= $s['skill_type'] === 'TEACH' ? 'Can Teach' : 'Want to Learn' ?>
                                    </span>
                                </li>
                            <?php endforeach; ?>
                        </ul>
                    <?php endif; ?>
                </div>
            </div>
        </div>

        <!-- ==========================================
             MODULE 2 & 3: VIEW OTHER SKILLS & SEND REQUESTS
             ========================================== -->
        <div class="col-lg-8">
            <!-- Discover Other Students' Skills -->
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Explore Skills From Other Students</div>
                <div class="card-body p-0">
                    <?php if (empty($other_skills)): ?>
                        <p class="text-muted text-center py-4 mb-0 small">No skills from other students available yet.</p>
                    <?php else: ?>
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
                                    <?php foreach ($other_skills as $os): ?>
                                        <tr>
                                            <td>
                                                <div class="fw-bold"><?= htmlspecialchars($os['skill_name']) ?></div>
                                                <small class="text-muted"><?= htmlspecialchars($os['description']) ?></small>
                                            </td>
                                            <td>
                                                <span class="badge <?= $os['skill_type'] === 'TEACH' ? 'bg-success' : 'bg-info' ?>">
                                                    <?= $os['skill_type'] === 'TEACH' ? 'Teaching' : 'Learning' ?>
                                                </span>
                                            </td>
                                            <td><?= htmlspecialchars($os['student_name']) ?></td>
                                            <td><?= htmlspecialchars($os['department']) ?></td>
                                            <td class="text-end">
                                                <!-- Send Exchange Request Form (submits to Java Servlet) -->
                                                <form action="<?= $process_request_url ?>" method="POST" class="d-inline">
                                                    <input type="hidden" name="action" value="send">
                                                    <input type="hidden" name="sender_id" value="<?= $student_id ?>">
                                                    <input type="hidden" name="receiver_id" value="<?= $os['student_id'] ?>">
                                                    <input type="hidden" name="skill_id" value="<?= $os['id'] ?>">
                                                    <input type="hidden" name="message" value="Hi! Let's connect and exchange skills.">
                                                    <button type="submit" class="btn btn-sm btn-outline-primary">
                                                        Request Exchange
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- ==========================================
                 MODULE 3: INCOMING & OUTGOING EXCHANGE REQUESTS
                 ========================================== -->
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white fw-bold py-3">Incoming Exchange Proposals</div>
                <div class="card-body p-0">
                    <?php if (empty($incoming_requests)): ?>
                        <p class="text-muted text-center py-4 mb-0 small">No incoming requests yet.</p>
                    <?php else: ?>
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
                                <tbody>
                                    <?php foreach ($incoming_requests as $in): ?>
                                        <tr>
                                            <td>
                                                <div class="fw-semibold"><?= htmlspecialchars($in['sender_name']) ?></div>
                                                <small class="text-muted"><?= htmlspecialchars($in['sender_email']) ?></small>
                                            </td>
                                            <td><span class="badge bg-secondary"><?= htmlspecialchars($in['skill_name']) ?></span></td>
                                            <td><small class="text-muted"><?= htmlspecialchars($in['message']) ?></small></td>
                                            <td>
                                                <?php if ($in['status'] === 'PENDING'): ?>
                                                    <span class="badge bg-warning text-dark">PENDING</span>
                                                <?php elseif ($in['status'] === 'ACCEPTED'): ?>
                                                    <span class="badge bg-success">ACCEPTED</span>
                                                <?php else: ?>
                                                    <span class="badge bg-danger">REJECTED</span>
                                                <?php endif; ?>
                                            </td>
                                            <td class="text-end">
                                                <?php if ($in['status'] === 'PENDING'): ?>
                                                    <!-- Accept Form (Processed by Java Servlet) -->
                                                    <form action="<?= $process_request_url ?>" method="POST" class="d-inline">
                                                        <input type="hidden" name="action" value="accept">
                                                        <input type="hidden" name="request_id" value="<?= $in['id'] ?>">
                                                        <input type="hidden" name="receiver_id" value="<?= $student_id ?>">
                                                        <button type="submit" class="btn btn-sm btn-success">Accept</button>
                                                    </form>
                                                    <!-- Reject Form (Processed by Java Servlet) -->
                                                    <form action="<?= $process_request_url ?>" method="POST" class="d-inline">
                                                        <input type="hidden" name="action" value="reject">
                                                        <input type="hidden" name="request_id" value="<?= $in['id'] ?>">
                                                        <input type="hidden" name="receiver_id" value="<?= $student_id ?>">
                                                        <button type="submit" class="btn btn-sm btn-outline-danger">Reject</button>
                                                    </form>
                                                <?php else: ?>
                                                    <small class="text-muted">Completed</small>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Outgoing Requests Sent -->
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-header bg-white fw-bold py-3">Requests You Sent</div>
                <div class="card-body p-0">
                    <?php if (empty($outgoing_requests)): ?>
                        <p class="text-muted text-center py-4 mb-0 small">You have not sent any exchange requests yet.</p>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th>Sent To</th>
                                        <th>Skill</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($outgoing_requests as $out): ?>
                                        <tr>
                                            <td><?= htmlspecialchars($out['receiver_name']) ?></td>
                                            <td><span class="badge bg-secondary"><?= htmlspecialchars($out['skill_name']) ?></span></td>
                                            <td>
                                                <?php if ($out['status'] === 'PENDING'): ?>
                                                    <span class="badge bg-warning text-dark">PENDING</span>
                                                <?php elseif ($out['status'] === 'ACCEPTED'): ?>
                                                    <span class="badge bg-success">ACCEPTED</span>
                                                <?php else: ?>
                                                    <span class="badge bg-danger">REJECTED</span>
                                                <?php endif; ?>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

        </div>
    </div>
</div>

<footer class="text-center py-4 text-muted small mt-5">
    SkillSwap – Student Skill Exchange Platform &copy; <?= date('Y') ?> | Built with PHP, Java Servlets &amp; MySQL
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
