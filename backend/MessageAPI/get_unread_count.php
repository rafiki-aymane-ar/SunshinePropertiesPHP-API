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
        throw new Exception('Utilisateur non trouvé dans la base de données.');
    }

    $stmt = $pdo->prepare("
        SELECT COUNT(*) as unread_count
        FROM messages 
        WHERE receiver_type = ? AND receiver_id = ? AND is_read = FALSE
    ");
    $stmt->execute([$user_type, $user_id]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'unread_count' => (int)$result['unread_count']
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>

