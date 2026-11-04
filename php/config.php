<?php
// Database configuration for XAMPP MySQL
$host = "localhost";
$dbname = "skillswap";
$username = "root";
$password = "";

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
