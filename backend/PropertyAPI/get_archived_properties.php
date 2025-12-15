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
    
    // Récupérer toutes les propriétés archivées
    $stmt = $pdo->query("
        SELECT 
            id,
            original_id,
            title,
            description,
            price,
            type,
            surface,
            rooms,
            address,
            city,
            status,
            created_by,
            created_at,
            archived_at,
            archived_by
        FROM archived_properties 
        ORDER BY archived_at DESC
    ");
    
    $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "properties" => $properties,
        "count" => count($properties),
        "message" => count($properties) . " propriétés archivées trouvées"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage(),
        "properties" => []
    ]);
}
?>

