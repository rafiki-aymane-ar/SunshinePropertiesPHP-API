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
        throw new Exception("Connexion DB non disponible");
    }
    
    if (empty($input['id'])) {
        echo json_encode(["success" => false, "message" => "ID bien manquant"]);
        exit;
    }
    
    // Vérifier si le bien existe
    $checkStmt = $pdo->prepare("SELECT id FROM properties WHERE id = ?");
    $checkStmt->execute([$input['id']]);
    
    if ($checkStmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Bien non trouvé"]);
        exit;
    }
    
    $sql = "UPDATE properties SET 
            title = ?, description = ?, price = ?, type = ?, surface = ?, rooms = ?, 
            address = ?, city = ?, status = ?
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $input['title'],
        $input['description'] ?? '',
        $input['price'],
        $input['type'] ?? 'appartement',
        $input['surface'] ?? null,
        $input['rooms'] ?? null,
        $input['address'] ?? '',
        $input['city'] ?? '',
        $input['status'] ?? 'disponible',
        $input['id']
    ]);
    
    if ($success) {
        echo json_encode([
            "success" => true, 
            "message" => "Bien mis à jour avec succès"
        ]);
    } else {
        throw new Exception("Erreur lors de la mise à jour du bien");
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>