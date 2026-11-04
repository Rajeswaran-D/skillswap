<?php
// Database configuration for InfinityFree MySQL
$host = "sql209.infinityfree.com";
$dbname = "if0_43351014_skillswap";
$username = "if0_43351014";
$password = "2IXag0vRZdju";
$port = 3306;

try {
    // Primary attempt: Host with port and UTF-8 charset
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);
} catch (PDOException $e) {
    // Fallback attempt: Standard DSN format
    try {
        $dsn = "mysql:host=$host;dbname=$dbname";
        $conn = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]);
    } catch (PDOException $e2) {
        die("<div style='font-family:sans-serif;padding:25px;margin:40px auto;max-width:650px;border:1px solid #fca5a5;background:#fff1f2;border-radius:10px;color:#991b1b;box-shadow:0 4px 12px rgba(0,0,0,0.05);'>" .
            "<h3 style='margin-top:0;color:#b91c1c;'>⚠️ Database Connection Failed</h3>" .
            "<p><b>Exact Error:</b> <code>" . htmlspecialchars($e2->getMessage()) . "</code></p>" .
            "<hr style='border:0;border-top:1px solid #fecdd3;margin:15px 0;'>" .
            "<p style='font-size:14px;color:#374151;margin-bottom:8px;'><b>Common InfinityFree Causes &amp; Solutions:</b></p>" .
            "<ul style='font-size:13px;color:#4b5563;line-height:1.6;padding-left:20px;'>" .
            "<li><b>Propagation Delay:</b> If you just created the database, InfinityFree takes <b>2–5 minutes</b> to sync permissions. Wait 3 minutes and refresh.</li>" .
            "<li><b>Password Verification:</b> In the InfinityFree client panel, verify if your vPanel password matches <code>2IXag0vRZdju</code>.</li>" .
            "<li><b>Database Name:</b> Verify in phpMyAdmin that the active database is <code>if0_43351014_skillswap</code>.</li>" .
            "</ul>" .
            "</div>");
    }
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
