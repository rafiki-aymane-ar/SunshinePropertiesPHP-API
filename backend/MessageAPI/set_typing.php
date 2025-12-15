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
    if (empty($input['user_type']) || empty($input['user_id']) || 
        empty($input['receiver_type']) || empty($input['receiver_id'])) {
        throw new Exception('Tous les paramètres sont requis');
    }

    $user_type = $input['user_type'];
    $user_input = $input['user_id'];
    $receiver_type = $input['receiver_type'];
    $receiver_input = $input['receiver_id'];
    $is_typing = isset($input['is_typing']) ? (bool)$input['is_typing'] : true;

    // Obtenir les IDs numériques
    $user_id = getUserIdFromInput($user_type, $user_input);
    $receiver_id = getUserIdFromInput($receiver_type, $receiver_input);

    if (!$user_id || !$receiver_id) {
        throw new Exception('Utilisateur ou destinataire non trouvé dans la base de données');
    }

    // Utiliser une table temporaire pour stocker l'état de frappe
    // Créer la table si elle n'existe pas
    $create_table_sql = "
        CREATE TABLE IF NOT EXISTS typing_status (
            id INT AUTO_INCREMENT PRIMARY KEY,
            sender_type VARCHAR(20) NOT NULL,
            sender_id INT NOT NULL,
            receiver_type VARCHAR(20) NOT NULL,
            receiver_id INT NOT NULL,
            is_typing BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_typing (sender_type, sender_id, receiver_type, receiver_id),
            INDEX idx_receiver (receiver_type, receiver_id, updated_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($create_table_sql);

    if ($is_typing) {
        // Insérer ou mettre à jour l'état de frappe
        $stmt = $pdo->prepare("
            INSERT INTO typing_status (sender_type, sender_id, receiver_type, receiver_id, is_typing, updated_at)
            VALUES (?, ?, ?, ?, TRUE, NOW())
            ON DUPLICATE KEY UPDATE is_typing = TRUE, updated_at = NOW()
        ");
        $stmt->execute([$user_type, $user_id, $receiver_type, $receiver_id]);
    } else {
        // Marquer comme non en train d'écrire
        $stmt = $pdo->prepare("
            UPDATE typing_status 
            SET is_typing = FALSE, updated_at = NOW()
            WHERE sender_type = ? AND sender_id = ? 
            AND receiver_type = ? AND receiver_id = ?
        ");
        $stmt->execute([$user_type, $user_id, $receiver_type, $receiver_id]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'État de frappe mis à jour'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>

