<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

try {
    if (empty($input['id'])) {
        throw new Exception('ID du rendez-vous manquant');
    }
    
    $sql = "DELETE FROM appointments WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([$input['id']]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Rendez-vous supprimé avec succès'
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