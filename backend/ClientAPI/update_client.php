<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include "../config/db.php";

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($pdo)) {
        throw new Exception("Connexion base de données non disponible");
    }
    
    if (empty($input['id'])) {
        echo json_encode(["success" => false, "message" => "ID client manquant"]);
        exit;
    }
    
    // Vérifier si le client existe
    $checkStmt = $pdo->prepare("SELECT id FROM clients WHERE id = ?");
    $checkStmt->execute([$input['id']]);
    
    if ($checkStmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Client non trouvé"]);
        exit;
    }
    
    // Mettre à jour le client
    $sql = "UPDATE clients SET 
            civility = ?, first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
            preferred_type = ?, min_budget = ?, max_budget = ?, preferred_zones = ?,
            specific_criteria = ?, status = ?, acquisition_source = ?
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $input['civility'] ?? 'M',
        $input['first_name'],
        $input['last_name'],
        $input['email'] ?? '',
        $input['phone'] ?? '',
        $input['address'] ?? '',
        $input['preferred_type'] ?? '',
        $input['min_budget'] ?? null,
        $input['max_budget'] ?? null,
        $input['preferred_zones'] ?? '',
        $input['specific_criteria'] ?? '',
        $input['status'] ?? 'nouveau',
        $input['acquisition_source'] ?? '',
        $input['id']
    ]);
    
    if ($success) {
        echo json_encode([
            "success" => true, 
            "message" => "Client mis à jour avec succès"
        ]);
    } else {
        throw new Exception("Erreur lors de la mise à jour du client");
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>