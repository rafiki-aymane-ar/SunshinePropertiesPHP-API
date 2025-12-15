<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
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
    
    $propertyId = intval($input['id']);
    
    // Récupérer l'ID de l'utilisateur qui archive (si disponible)
    $archivedBy = null;
    if (!empty($input['archived_by']) && is_numeric($input['archived_by'])) {
        $archivedBy = intval($input['archived_by']);
    } else {
        // Essayer depuis le header Authorization
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                      (isset($headers['authorization']) ? $headers['authorization'] : null);
        if ($authHeader && preg_match('/token_(\d+)/', str_replace('Bearer ', '', $authHeader), $matches)) {
            $archivedBy = intval($matches[1]);
        }
    }
    
    // Vérifier si le bien existe
    $checkStmt = $pdo->prepare("
        SELECT id, title, description, price, type, surface, rooms, 
               address, city, status, created_by, created_at
        FROM properties 
        WHERE id = ?
    ");
    $checkStmt->execute([$propertyId]);
    $property = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$property) {
        echo json_encode(["success" => false, "message" => "Bien non trouvé"]);
        exit;
    }
    
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    try {
        // Insérer dans la table d'archivage
        $archiveStmt = $pdo->prepare("
            INSERT INTO archived_properties (
                original_id, title, description, price, type, surface, rooms,
                address, city, status, created_by, created_at, archived_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $archiveSuccess = $archiveStmt->execute([
            $property['id'],
            $property['title'],
            $property['description'],
            $property['price'],
            $property['type'],
            $property['surface'],
            $property['rooms'],
            $property['address'],
            $property['city'],
            $property['status'],
            $property['created_by'],
            $property['created_at'],
            $archivedBy
        ]);
        
        if (!$archiveSuccess) {
            throw new Exception("Erreur lors de l'archivage du bien");
        }
        
        // Supprimer de la table principale
        $deleteStmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
        $deleteSuccess = $deleteStmt->execute([$propertyId]);
        
        if ($deleteSuccess) {
            $pdo->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Bien archivé avec succès"
            ]);
        } else {
            throw new Exception("Erreur lors de la suppression du bien");
        }
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }
    
} catch (Exception $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>