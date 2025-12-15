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
        echo json_encode(["success" => false, "message" => "ID client archivé manquant"]);
        exit;
    }
    
    $archiveId = intval($input['id']);
    
    // Récupérer le client archivé
    $checkStmt = $pdo->prepare("
        SELECT original_id, civility, first_name, last_name, email, phone, address,
               preferred_type, min_budget, max_budget, preferred_zones, specific_criteria,
               status, acquisition_source, assigned_agent_id, created_at
        FROM archived_clients 
        WHERE id = ?
    ");
    $checkStmt->execute([$archiveId]);
    $archivedClient = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$archivedClient) {
        echo json_encode(["success" => false, "message" => "Client archivé non trouvé"]);
        exit;
    }
    
    // Vérifier si un client avec le même original_id existe déjà
    $existingStmt = $pdo->prepare("SELECT id FROM clients WHERE id = ?");
    $existingStmt->execute([$archivedClient['original_id']]);
    if ($existingStmt->fetch()) {
        echo json_encode([
            "success" => false, 
            "message" => "Un client avec cet ID existe déjà. Impossible de restaurer."
        ]);
        exit;
    }
    
    // Démarrer une transaction
    $pdo->beginTransaction();
    
    try {
        // Insérer dans la table principale
        $restoreStmt = $pdo->prepare("
            INSERT INTO clients (
                id, civility, first_name, last_name, email, phone, address,
                preferred_type, min_budget, max_budget, preferred_zones, specific_criteria,
                status, acquisition_source, assigned_agent_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $restoreSuccess = $restoreStmt->execute([
            $archivedClient['original_id'],
            $archivedClient['civility'],
            $archivedClient['first_name'],
            $archivedClient['last_name'],
            $archivedClient['email'],
            $archivedClient['phone'],
            $archivedClient['address'],
            $archivedClient['preferred_type'],
            $archivedClient['min_budget'],
            $archivedClient['max_budget'],
            $archivedClient['preferred_zones'],
            $archivedClient['specific_criteria'],
            $archivedClient['status'],
            $archivedClient['acquisition_source'],
            $archivedClient['assigned_agent_id'],
            $archivedClient['created_at']
        ]);
        
        if (!$restoreSuccess) {
            throw new Exception("Erreur lors de la restauration du client");
        }
        
        // Supprimer de la table d'archivage
        $deleteStmt = $pdo->prepare("DELETE FROM archived_clients WHERE id = ?");
        $deleteSuccess = $deleteStmt->execute([$archiveId]);
        
        if ($deleteSuccess) {
            $pdo->commit();
            echo json_encode([
                "success" => true, 
                "message" => "Client restauré avec succès"
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

