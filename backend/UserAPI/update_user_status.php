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
    if (empty($input['id']) || !isset($input['is_active'])) {
        throw new Exception('ID utilisateur et statut requis');
    }
    
    $user_id = (int)$input['id'];
    
    // Conversion correcte pour MySQL (1 pour true, 0 pour false)
    $is_active = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);
    $is_active_mysql = $is_active ? 1 : 0;
    
    // Vérifier si l'utilisateur existe
    $checkStmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $checkStmt->execute([$user_id]);
    $user = $checkStmt->fetch();
    
    if (!$user) {
        throw new Exception('Utilisateur non trouvé');
    }
    
    // Empêcher la désactivation du dernier admin
    if ($user['role'] === 'admin' && !$is_active) {
        $adminCountStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin' AND is_active = true");
        $adminCountStmt->execute();
        $adminCount = $adminCountStmt->fetch()['admin_count'];
        
        if ($adminCount <= 1) {
            throw new Exception('Impossible de désactiver le dernier administrateur actif');
        }
    }
    
    $sql = "UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([$is_active_mysql, $user_id]);
    
    if ($success) {
        $status_text = $is_active ? 'activé' : 'désactivé';
        echo json_encode([
            'success' => true,
            'message' => "Utilisateur $status_text avec succès",
            'data' => [
                'id' => $user_id,
                'is_active' => $is_active
            ]
        ]);
    } else {
        throw new Exception('Erreur lors de la mise à jour du statut');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>