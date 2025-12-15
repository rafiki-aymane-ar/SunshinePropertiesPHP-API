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
    if (empty($input['id'])) {
        throw new Exception('ID utilisateur requis');
    }
    
    $user_id = $input['id'];
    
    // Vérifier si l'utilisateur existe
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $checkStmt->execute([$user_id]);
    if (!$checkStmt->fetch()) {
        throw new Exception('Utilisateur non trouvé');
    }
    
    // Construire la requête dynamiquement
    $updateFields = [];
    $params = [];
    
    $allowedFields = ['full_name', 'email', 'phone', 'role', 'is_active'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $updateFields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    // Gérer le mot de passe séparément
    if (!empty($input['password'])) {
        $updateFields[] = "password = ?";
        $params[] = password_hash($input['password'], PASSWORD_DEFAULT);
    }
    
    if (empty($updateFields)) {
        throw new Exception('Aucune donnée à mettre à jour');
    }
    
    $params[] = $user_id;
    
    $sql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute($params);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Utilisateur mis à jour avec succès'
        ]);
    } else {
        throw new Exception('Erreur lors de la mise à jour');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>