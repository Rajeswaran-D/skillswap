<?php
require_once "config.php";

$error = "";

// If already logged in, redirect to dashboard
if (isset($_SESSION["student_id"])) {
    header("Location: index.php");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = trim($_POST["email"] ?? "");
    $password = trim($_POST["password"] ?? "");

    if (empty($email) || empty($password)) {
        $error = "Please enter both email and password.";
    } else {
        // Fetch student using Prepared Statement
        $stmt = $conn->prepare("SELECT * FROM students WHERE email = ?");
        $stmt->execute([$email]);
        $student = $stmt->fetch();

        // Verify password hash
        if ($student && password_verify($password, $student["password"])) {
            $_SESSION["student_id"] = $student["id"];
            $_SESSION["student_name"] = $student["name"];
            $_SESSION["student_dept"] = $student["department"];

            header("Location: index.php");
            exit;
        } else {
            $error = "Invalid email or password.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login – SkillSwap</title>
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
                    <h5 class="text-center text-muted mb-4">Student Login</h5>

                    <?php if (!empty($error)): ?>
                        <div class="alert alert-danger py-2"><?= htmlspecialchars($error) ?></div>
                    <?php endif; ?>

                    <?php if (isset($_GET['msg']) && $_GET['msg'] === 'logged_out'): ?>
                        <div class="alert alert-info py-2">You have logged out successfully.</div>
                    <?php endif; ?>

                    <form action="login.php" method="POST">
                        <div class="mb-3">
                            <label class="form-label">College Email</label>
                            <input type="email" name="email" class="form-control" required placeholder="e.g. rahul@college.edu">
                        </div>

                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" name="password" class="form-control" required placeholder="••••••••">
                        </div>

                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold">Login</button>
                    </form>

                    <p class="text-center mt-3 mb-0 text-muted small">
                        Don't have an account? <a href="register.php">Register here</a>
                    </p>

                    <!-- Quick Sample Credentials for Demo -->
                    <div class="mt-4 p-2 bg-light border rounded small text-secondary">
                        <strong>Sample Account:</strong> <code>rahul@college.edu</code> | Pass: <code>123456</code>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

</body>
</html>
