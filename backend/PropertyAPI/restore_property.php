<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
        echo json_encode(["success" => false, "message" => "ID propriété archivée manquant"]);
        exit;
    }
    
    $archiveId = intval($input['id']);
    
    // Récupérer la propriété archivée
    $checkStmt = $pdo->prepare("
        SELECT original_id, title, description, price, type, surface, rooms,
               address, city, status, created_by, created_at
        FROM archived_properties 
        WHERE id = ?
    ");
    $checkStmt->execute([$archiveId]);
    $archivedProperty = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$archivedProperty) {
        echo json_encode(["success" => false, "message" => "Propriété archivée non trouvée"]);
        exit;
    }
    
    // Vérifier si une propriété avec le même original_id existe déjà
    $existingStmt = $pdo->prepare("SELECT id FROM properties WHERE id = ?");
    $existingStmt->execute([$archivedProperty['original_id']]);
    if ($existingStmt->fetch()) {
        echo json_encode([
            "success" => false, 
            "message" => "Une propriété avec cet ID existe déjà. Impossible de restaurer."
        ]);
        exit;
    }
    
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    try {
        // Insérer dans la table principale
        $restoreStmt = $pdo->prepare("
            INSERT INTO properties (
                id, title, description, price, type, surface, rooms,
                address, city, status, created_by, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $restoreSuccess = $restoreStmt->execute([
            $archivedProperty['original_id'],
            $archivedProperty['title'],
            $archivedProperty['description'],
            $archivedProperty['price'],
            $archivedProperty['type'],
            $archivedProperty['surface'],
            $archivedProperty['rooms'],
            $archivedProperty['address'],
            $archivedProperty['city'],
            $archivedProperty['status'],
            $archivedProperty['created_by'],
            $archivedProperty['created_at']
        ]);
        
        if (!$restoreSuccess) {
            throw new Exception("Erreur lors de la restauration de la propriété");
        }
        
        // Supprimer de la table d'archivage
        $deleteStmt = $pdo->prepare("DELETE FROM archived_properties WHERE id = ?");
        $deleteSuccess = $deleteStmt->execute([$archiveId]);
        
        if ($deleteSuccess) {
            $pdo->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Propriété restaurée avec succès"
            ]);
        } else {
            throw new Exception("Erreur lors de la suppression de l'archive");
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

