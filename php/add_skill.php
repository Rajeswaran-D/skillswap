<?php
/**
 * SkillSwap – Add Skill Handler (PHP Edition for InfinityFree / Shared Hosting)
 * Drop-in equivalent for AddSkillServlet.java
 */
require_once "config.php";
check_login();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $student_id = $_SESSION["student_id"];
    $skill_name = trim($_POST["skill_name"] ?? "");
    $skill_type = trim($_POST["skill_type"] ?? "");
    $description = trim($_POST["description"] ?? "");

    if (empty($skill_name) || empty($skill_type)) {
        header("Location: index.php?error=missing_fields");
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO skills (student_id, skill_name, skill_type, description) VALUES (?, ?, ?, ?)");
        $stmt->execute([$student_id, $skill_name, strtoupper($skill_type), $description]);
        header("Location: index.php?msg=skill_added");
        exit;
    } catch (PDOException $e) {
        header("Location: index.php?error=db_error");
        exit;
    }
}

header("Location: index.php");
exit;
