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

$input = json_decode(file_get_contents('php://input'), true);

try {
    // Validation
    if (empty($input['full_name']) || empty($input['email']) || empty($input['password'])) {
        throw new Exception('Tous les champs obligatoires doivent être remplis');
    }
    
    // Vérifier si l'email existe déjà
    $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $checkStmt->execute([$input['email']]);
    if ($checkStmt->fetch()) {
        throw new Exception('Un utilisateur avec cet email existe déjà');
    }
    
    // Hasher le mot de passe
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    
    $sql = "INSERT INTO users (full_name, email, phone, password, role, is_active) 
            VALUES (?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $input['full_name'],
        $input['email'],
        $input['phone'] ?? '',
        $hashedPassword,
        $input['role'] ?? 'agent',
        $input['is_active'] ?? true
    ]);
    
    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'user_id' => $pdo->lastInsertId()
        ]);
    } else {
        throw new Exception('Erreur lors de la création');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>