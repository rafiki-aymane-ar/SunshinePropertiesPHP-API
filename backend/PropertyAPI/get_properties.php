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
    
    // Récupérer les paramètres de filtrage
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 0;
    $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';

    // Construction de la requête SQL
    $sql = "SELECT 
            id,
            title,
            description,
            price,
            type,
            surface,
            rooms,
            address,
            city,
            status,
            created_at
        FROM properties 
        ORDER BY created_at DESC";
    
    // Si limit est défini (utilisé pour featured aussi)
    if ($limit > 0) {
        $sql .= " LIMIT " . $limit;
    }

    $stmt = $pdo->query($sql);
    
    $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "properties" => $properties,
        "count" => count($properties),
        "message" => count($properties) . " biens trouvés"
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage(),
        "properties" => []
    ]);
}
?>