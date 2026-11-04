<?php
/**
 * SkillSwap – Request Processing Handler (PHP Edition for InfinityFree / Shared Hosting)
 * Drop-in equivalent for ProcessRequestServlet.java (Send, Accept, Reject)
 */
require_once "config.php";
check_login();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $action = $_POST["action"] ?? "";
    $current_student_id = $_SESSION["student_id"];

    try {
        // 1. Send Exchange Request
        if ($action === "send") {
            $receiver_id = intval($_POST["receiver_id"] ?? 0);
            $skill_id = intval($_POST["skill_id"] ?? 0);
            $message = trim($_POST["message"] ?? "Hi! Let's connect and exchange skills.");

            $stmt = $conn->prepare("INSERT INTO requests (sender_id, receiver_id, skill_id, message, status) VALUES (?, ?, ?, ?, 'PENDING')");
            $stmt->execute([$current_student_id, $receiver_id, $skill_id, $message]);
            header("Location: index.php?msg=request_sent");
            exit;
        }

        // 2. Accept Exchange Request
        elseif ($action === "accept") {
            $request_id = intval($_POST["request_id"] ?? 0);
            $stmt = $conn->prepare("UPDATE requests SET status = 'ACCEPTED' WHERE id = ? AND receiver_id = ?");
            $stmt->execute([$request_id, $current_student_id]);
            header("Location: index.php?msg=request_accepted");
            exit;
        }

        // 3. Reject Exchange Request
        elseif ($action === "reject") {
            $request_id = intval($_POST["request_id"] ?? 0);
            $stmt = $conn->prepare("UPDATE requests SET status = 'REJECTED' WHERE id = ? AND receiver_id = ?");
            $stmt->execute([$request_id, $current_student_id]);
            header("Location: index.php?msg=request_rejected");
            exit;
        }
    } catch (PDOException $e) {
        header("Location: index.php?error=request_error");
        exit;
    }
}

header("Location: index.php");
exit;
