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
    $sender_type = $_GET['sender_type'] ?? null;
    $sender_input = $_GET['sender_id'] ?? null;

    if (!$user_type || !$user_input || !$sender_type || !$sender_input) {
        throw new Exception('Tous les paramètres sont requis');
    }

    // Obtenir les IDs numériques
    $user_id = getUserIdFromInput($user_type, $user_input);
    $sender_id = getUserIdFromInput($sender_type, $sender_input);

    if (!$user_id || !$sender_id) {
        throw new Exception('Utilisateur ou expéditeur non trouvé dans la base de données');
    }

    // Vérifier si l'expéditeur est en train d'écrire
    // Ne vérifier que les états mis à jour dans les 5 dernières secondes
    $stmt = $pdo->prepare("
        SELECT is_typing, updated_at
        FROM typing_status
        WHERE sender_type = ? AND sender_id = ?
        AND receiver_type = ? AND receiver_id = ?
        AND updated_at >= DATE_SUB(NOW(), INTERVAL 5 SECOND)
    ");
    $stmt->execute([$sender_type, $sender_id, $user_type, $user_id]);
    $typing_status = $stmt->fetch(PDO::FETCH_ASSOC);

    $is_typing = false;
    if ($typing_status && $typing_status['is_typing']) {
        $is_typing = true;
    }

    echo json_encode([
        'success' => true,
        'is_typing' => $is_typing
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage(),
        'is_typing' => false
    ]);
}
?>

