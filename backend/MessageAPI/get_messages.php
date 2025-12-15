<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';
require_once 'user_id_helper.php';

try {
    $user_type = $_GET['user_type'] ?? null;
    $user_input = $_GET['user_id'] ?? null;
    $other_type = $_GET['other_type'] ?? null;
    $other_input = $_GET['other_id'] ?? null;
    $conversation_id = isset($_GET['conversation_id']) ? (int)$_GET['conversation_id'] : null;

    // Obtenir les IDs numériques si nécessaire
    $user_id = null;
    $other_id = null;
    
    if ($user_type && $user_input) {
        $user_id = getUserIdFromInput($user_type, $user_input);
        if (!$user_id) {
            throw new Exception('Utilisateur non trouvé dans la base de données.');
        }
    }
    
    if ($other_type && $other_input && is_numeric($other_input)) {
        $other_id = (int)$other_input;
    }

    if ((!$user_type || !$user_id || !$other_type || !$other_id) && !$conversation_id) {
        throw new Exception('Paramètres insuffisants');
    }

    // Récupérer les messages de la conversation
    if ($conversation_id) {
        // Par ID de conversation
        $conv_stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
        $conv_stmt->execute([$conversation_id]);
        $conv = $conv_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$conv) {
            throw new Exception('Conversation non trouvée');
        }

        $stmt = $pdo->prepare("
            SELECT m.*,
                CASE 
                    WHEN m.sender_type = 'client' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM clients WHERE id = m.sender_id)
                    ELSE (SELECT full_name FROM users WHERE id = m.sender_id)
                END as sender_name
            FROM messages m
            WHERE (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
               OR (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        ");
        $stmt->execute([
            $conv['participant1_type'], $conv['participant1_id'], $conv['participant2_type'], $conv['participant2_id'],
            $conv['participant2_type'], $conv['participant2_id'], $conv['participant1_type'], $conv['participant1_id']
        ]);
    } else {
        // Par participants
        $stmt = $pdo->prepare("
            SELECT m.*,
                CASE 
                    WHEN m.sender_type = 'client' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM clients WHERE id = m.sender_id)
                    ELSE (SELECT full_name FROM users WHERE id = m.sender_id)
                END as sender_name
            FROM messages m
            WHERE (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
               OR (m.sender_type = ? AND m.sender_id = ? AND m.receiver_type = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        ");
        $stmt->execute([
            $user_type, $user_id, $other_type, $other_id,
            $other_type, $other_id, $user_type, $user_id
        ]);
    }
    
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Marquer les messages comme lus
    if ($user_type && $user_id) {
        if ($conversation_id && isset($conv)) {
            // Pour une conversation spécifique, marquer les messages reçus
            $mark_stmt = $pdo->prepare("
                UPDATE messages 
                SET is_read = TRUE, read_at = NOW()
                WHERE receiver_type = ? AND receiver_id = ? AND is_read = FALSE
                AND (
                    (sender_type = ? AND sender_id = ?) 
                    OR (sender_type = ? AND sender_id = ?)
                )
            ");
            $mark_stmt->execute([
                $user_type, $user_id,
                $conv['participant1_type'], $conv['participant1_id'],
                $conv['participant2_type'], $conv['participant2_id']
            ]);
        } else if ($other_type && $other_id) {
            // Pour une conversation entre deux utilisateurs spécifiques
            $mark_stmt = $pdo->prepare("
                UPDATE messages 
                SET is_read = TRUE, read_at = NOW()
                WHERE receiver_type = ? AND receiver_id = ? AND is_read = FALSE
                AND sender_type = ? AND sender_id = ?
            ");
            $mark_stmt->execute([
                $user_type, $user_id,
                $other_type, $other_id
            ]);
        }
    }

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
