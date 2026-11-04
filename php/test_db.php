<?php
// Diagnostics script for InfinityFree Database Connection
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "sql209.infinityfree.com";
$dbname = "if0_43351014_skillswap";
$username = "if0_43351014";
$password = "2IXag0vRZdju";
$port = 3306;

echo "<h2>SkillSwap Database Connection Diagnostic</h2>";
echo "<p>Testing connection to <b>$host</b> on port <b>$port</b> with user <b>$username</b> and database <b>$dbname</b>...</p>";

// Test 1: PDO with port
echo "<h3>Test 1: PDO Connection (with port)</h3>";
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    echo "<p style='color:green;font-weight:bold;'>✓ SUCCESS! PDO connected successfully.</p>";
    
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "<p>Tables found: " . implode(", ", $tables) . "</p>";
} catch (PDOException $e) {
    echo "<p style='color:red;'>✗ FAILED: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Test 2: PDO without port & utf8mb4
echo "<h3>Test 2: PDO Connection (standard)</h3>";
try {
    $dsn = "mysql:host=$host;dbname=$dbname";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_TIMEOUT => 5
    ]);
    echo "<p style='color:green;font-weight:bold;'>✓ SUCCESS! PDO standard connected successfully.</p>";
} catch (PDOException $e) {
    echo "<p style='color:red;'>✗ FAILED: " . htmlspecialchars($e->getMessage()) . "</p>";
}

// Test 3: MySQLi
echo "<h3>Test 3: MySQLi Connection</h3>";
$mysqli = @new mysqli($host, $username, $password, $dbname, $port);
if ($mysqli->connect_error) {
    echo "<p style='color:red;'>✗ FAILED: " . htmlspecialchars($mysqli->connect_error) . " (Errno: " . $mysqli->connect_errno . ")</p>";
} else {
    echo "<p style='color:green;font-weight:bold;'>✓ SUCCESS! MySQLi connected successfully.</p>";
    $mysqli->close();
}
?>
