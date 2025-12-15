<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

try {
    if (empty($input['id']) || empty($input['status'])) {
        throw new Exception('ID ou statut manquant');
    }
    
    // Valider le statut
    $allowedStatus = ['scheduled', 'confirmed', 'done', 'cancelled', 'no_show'];
    if (!in_array($input['status'], $allowedStatus)) {
        throw new Exception('Statut invalide');
    }
    
    $sql = "UPDATE appointments SET 
            status = ?, 
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $input['status'],
        $input['id']
    ]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Statut du rendez-vous mis à jour'
        ]);
    } else {
        throw new Exception('Rendez-vous non trouvé');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>