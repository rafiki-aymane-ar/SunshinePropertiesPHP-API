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
        throw new Exception('ID utilisateur requis');
    }
    
    $user_id = $input['id'];
    
    // Vérifier si l'utilisateur existe
    $checkStmt = $pdo->prepare("SELECT id, role FROM users WHERE id = ?");
    $checkStmt->execute([$user_id]);
    $user = $checkStmt->fetch();
    
    if (!$user) {
        throw new Exception('Utilisateur non trouvé');
    }
    
    // Empêcher la suppression du dernier admin
    if ($user['role'] === 'admin') {
        $adminCountStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'");
        $adminCountStmt->execute();
        $adminCount = $adminCountStmt->fetch()['admin_count'];
        
        if ($adminCount <= 1) {
            throw new Exception('Impossible de supprimer le dernier administrateur');
        }
    }
    
    $sql = "DELETE FROM users WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([$user_id]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la suppression');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>