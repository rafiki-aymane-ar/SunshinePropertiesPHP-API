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
    if (!isset($pdo)) {
        throw new Exception("Connexion DB non disponible");
    }
    
    // Récupérer tous les clients archivés
    $stmt = $pdo->query("
        SELECT 
            id,
            original_id,
            civility,
            first_name,
            last_name,
            email,
            phone,
            address,
            preferred_type,
            min_budget,
            max_budget,
            preferred_zones,
            specific_criteria,
            status,
            acquisition_source,
            assigned_agent_id,
            created_at,
            archived_at,
            archived_by
        FROM archived_clients 
        ORDER BY archived_at DESC
    ");
    
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "clients" => $clients,
        "count" => count($clients),
        "message" => count($clients) . " clients archivés trouvés"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage(),
        "clients" => []
    ]);
}
?>

