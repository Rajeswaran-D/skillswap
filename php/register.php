<?php
require_once "config.php";

$message = "";
$msg_type = "danger";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = trim($_POST["name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $password = trim($_POST["password"] ?? "");
    $department = trim($_POST["department"] ?? "");

    // Basic Input Validation
    if (empty($name) || empty($email) || empty($password) || empty($department)) {
        $message = "Please fill in all required fields.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Please enter a valid email address.";
    } elseif (strlen($password) < 6) {
        $message = "Password must be at least 6 characters long.";
    } else {
        // Check duplicate email using Prepared Statement
        $check = $conn->prepare("SELECT id FROM students WHERE email = ?");
        $check->execute([$email]);

        if ($check->fetch()) {
            $message = "This email is already registered.";
        } else {
            // Hash password securely
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Insert student with Prepared Statement
            $stmt = $conn->prepare("INSERT INTO students (name, email, password, department) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$name, $email, $hashed_password, $department])) {
                $message = "Registration successful! You can now login.";
                $msg_type = "success";
            } else {
                $message = "Registration failed. Please try again.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register – SkillSwap</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-light">

<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-5">
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-body p-4">
                    <h3 class="text-center fw-bold text-primary mb-3">SkillSwap</h3>
                    <h5 class="text-center text-muted mb-4">Student Registration</h5>

                    <?php if (!empty($message)): ?>
                        <div class="alert alert-<?= $msg_type ?> py-2"><?= htmlspecialchars($message) ?></div>
                    <?php endif; ?>

                    <form action="register.php" method="POST">
                        <div class="mb-3">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="name" class="form-control" required placeholder="e.g. Rahul Sharma">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">College Email</label>
                            <input type="email" name="email" class="form-control" required placeholder="e.g. rahul@college.edu">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Department</label>
                            <input type="text" name="department" class="form-control" required placeholder="e.g. Computer Science">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" minlength="6" required placeholder="Min 6 characters">
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Register</button>
                    </form>

                    <p class="text-center mt-3 mb-0 text-muted small">
                        Already have an account? <a href="login.php">Login here</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
