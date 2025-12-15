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
    
    if (!$user_type || !$user_input) {
        throw new Exception('user_type et user_id sont requis');
    }
    
    // Obtenir l'ID numérique de la base de données
    $user_id = getUserIdFromInput($user_type, $user_input);
    
    if (!$user_id) {
        throw new Exception('Utilisateur non trouvé dans la base de données');
    }

    // Récupérer toutes les conversations de l'utilisateur
    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.participant1_type,
            c.participant1_id,
            c.participant2_type,
            c.participant2_id,
            c.last_message_at,
            m.content as last_message_content,
            m.sender_type as last_message_sender_type,
            m.sender_id as last_message_sender_id,
            (SELECT COUNT(*) FROM messages 
             WHERE ((receiver_type = ? AND receiver_id = ?) 
             AND ((sender_type = c.participant1_type AND sender_id = c.participant1_id) 
                  OR (sender_type = c.participant2_type AND sender_id = c.participant2_id)))
             AND is_read = FALSE) as unread_count
        FROM conversations c
        LEFT JOIN messages m ON c.last_message_id = m.id
        WHERE (c.participant1_type = ? AND c.participant1_id = ?)
           OR (c.participant2_type = ? AND c.participant2_id = ?)
        ORDER BY c.last_message_at DESC
    ");
    
    $stmt->execute([$user_type, $user_id, $user_type, $user_id, $user_type, $user_id]);
    $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Enrichir avec les informations des participants
    foreach ($conversations as &$conv) {
        // Déterminer l'autre participant
        if ($conv['participant1_type'] == $user_type && $conv['participant1_id'] == $user_id) {
            $other_type = $conv['participant2_type'];
            $other_id = $conv['participant2_id'];
        } else {
            $other_type = $conv['participant1_type'];
            $other_id = $conv['participant1_id'];
        }

        // Récupérer les infos de l'autre participant
        if ($other_type == 'client') {
            $info_stmt = $pdo->prepare("SELECT id, CONCAT(first_name, ' ', last_name) as name, email FROM clients WHERE id = ?");
        } else {
            $info_stmt = $pdo->prepare("SELECT id, full_name as name, email, role FROM users WHERE id = ?");
        }
        $info_stmt->execute([$other_id]);
        $other_info = $info_stmt->fetch(PDO::FETCH_ASSOC);

        $conv['other_participant'] = [
            'type' => $other_type,
            'id' => $other_id,
            'name' => $other_info['name'] ?? 'Utilisateur inconnu',
            'email' => $other_info['email'] ?? '',
            'role' => $other_info['role'] ?? $other_type
        ];
    }

    echo json_encode([
        'success' => true,
        'conversations' => $conversations,
        'total' => count($conversations)
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>

