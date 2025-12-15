<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

try {
    $user1_type = isset($_GET['user1_type']) ? $_GET['user1_type'] : null;
    $user1_id = isset($_GET['user1_id']) ? (int)$_GET['user1_id'] : null;
    $user2_type = isset($_GET['user2_type']) ? $_GET['user2_type'] : null;
    $user2_id = isset($_GET['user2_id']) ? (int)$_GET['user2_id'] : null;
    
    if (!$user1_type || !$user1_id || !$user2_type || !$user2_id) {
        throw new Exception('Tous les paramètres sont requis');
    }
    
    // Récupérer la conversation entre les deux utilisateurs
    $sql = "
        SELECT 
            m.*,
            CASE 
                WHEN m.sender_type = 'client' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM clients WHERE id = m.sender_id)
                ELSE (SELECT full_name FROM users WHERE id = m.sender_id)
            END as sender_name,
            p.title as property_title
        FROM messages m
        LEFT JOIN properties p ON m.property_id = p.id
        WHERE (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
           OR (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $user1_type, $user1_id, $user2_type, $user2_id,
        $user2_type, $user2_id, $user1_type, $user1_id
    ]);
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Marquer les messages comme lus pour user1
    $updateSql = "
        UPDATE messages 
        SET is_read = TRUE, read_at = NOW()
        WHERE receiver_type = ? AND receiver_id = ? 
          AND sender_type = ? AND sender_id = ?
          AND is_read = FALSE
    ";
    $updateStmt = $pdo->prepare($updateSql);
    $updateStmt->execute([$user1_type, $user1_id, $user2_type, $user2_id]);
    
    echo json_encode([
        'success' => true,
        'messages' => $messages,
        'total' => count($messages)
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>

