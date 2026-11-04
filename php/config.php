<?php
// Database configuration for InfinityFree MySQL
$host = "sql209.infinityfree.com";
$dbname = "if0_43351014_skillswap";
$username = "if0_43351014";
$password = "2IXag0vRZdju";

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die("Database connection failed: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Redirect guest users to login page
function check_login() {
    if (!isset($_SESSION['student_id'])) {
        header("Location: login.php");
        exit;
    }
}
?>
