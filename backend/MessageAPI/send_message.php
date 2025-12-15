<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';
require_once 'user_id_helper.php';

$input = json_decode(file_get_contents('php://input'), true);

try {
    // Validation
    if (empty($input['sender_type']) || empty($input['sender_id']) || 
        empty($input['receiver_type']) || empty($input['receiver_id']) || 
        empty($input['content'])) {
        throw new Exception('Tous les champs obligatoires doivent être remplis');
    }

    $sender_type = $input['sender_type'];
    $sender_input = $input['sender_id'];
    $receiver_type = $input['receiver_type'];
    $receiver_input = $input['receiver_id'];
    
    // Convertir les IDs (peuvent être des UID Firebase ou des IDs numériques)
    $sender_id = getUserIdFromInput($sender_type, $sender_input);
    if (!$sender_id) {
        throw new Exception('Expéditeur non trouvé dans la base de données');
    }
    
    // Pour le receiver, vérifier si c'est un ID numérique ou besoin de conversion
    if (is_numeric($receiver_input) && (int)$receiver_input > 0) {
        $receiver_id = (int)$receiver_input;
    } else {
        $receiver_id = getUserIdFromInput($receiver_type, $receiver_input);
        if (!$receiver_id) {
            throw new Exception('Destinataire non trouvé dans la base de données');
        }
    }
    $subject = $input['subject'] ?? null;
    $content = $input['content'];
    $property_id = isset($input['property_id']) ? (int)$input['property_id'] : null;
    $appointment_id = isset($input['appointment_id']) ? (int)$input['appointment_id'] : null;

    // Insérer le message
    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_type, sender_id, receiver_type, receiver_id, subject, content, property_id, appointment_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $sender_type,
        $sender_id,
        $receiver_type,
        $receiver_id,
        $subject,
        $content,
        $property_id,
        $appointment_id
    ]);
    
    $message_id = $pdo->lastInsertId();

    // Mettre à jour ou créer la conversation
    // Normaliser l'ordre des participants (le plus petit ID en premier)
    if ($sender_type < $receiver_type || ($sender_type == $receiver_type && $sender_id < $receiver_id)) {
        $p1_type = $sender_type;
        $p1_id = $sender_id;
        $p2_type = $receiver_type;
        $p2_id = $receiver_id;
    } else {
        $p1_type = $receiver_type;
        $p1_id = $receiver_id;
        $p2_type = $sender_type;
        $p2_id = $sender_id;
    }

    // Vérifier si la conversation existe
    $conv_stmt = $pdo->prepare("
        SELECT id FROM conversations 
        WHERE participant1_type = ? AND participant1_id = ? 
        AND participant2_type = ? AND participant2_id = ?
    ");
    $conv_stmt->execute([$p1_type, $p1_id, $p2_type, $p2_id]);
    $conversation = $conv_stmt->fetch();

    if ($conversation) {
        // Mettre à jour la conversation existante
        $update_stmt = $pdo->prepare("
            UPDATE conversations 
            SET last_message_id = ?, last_message_at = NOW()
            WHERE id = ?
        ");
        $update_stmt->execute([$message_id, $conversation['id']]);
        $conversation_id = $conversation['id'];
    } else {
        // Créer une nouvelle conversation
        $create_stmt = $pdo->prepare("
            INSERT INTO conversations (participant1_type, participant1_id, participant2_type, participant2_id, last_message_id, last_message_at)
            VALUES (?, ?, ?, ?, ?, NOW())
        ");
        $create_stmt->execute([$p1_type, $p1_id, $p2_type, $p2_id, $message_id]);
        $conversation_id = $pdo->lastInsertId();
    }

    // Récupérer le message complet avec les informations du sender
    $message_stmt = $pdo->prepare("
        SELECT m.*,
            CASE 
                WHEN m.sender_type = 'client' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM clients WHERE id = m.sender_id)
                ELSE (SELECT full_name FROM users WHERE id = m.sender_id)
            END as sender_name
        FROM messages m
        WHERE m.id = ?
    ");
    $message_stmt->execute([$message_id]);
    $message_data = $message_stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => 'Message envoyé avec succès',
        'message_id' => $message_id,
        'conversation_id' => $conversation_id,
        'message_data' => $message_data
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>
