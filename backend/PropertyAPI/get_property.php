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
    
    // Vérifier si l'ID est fourni
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        echo json_encode([
            "success" => false,
            "message" => "ID de propriété requis",
            "property" => null
        ]);
        exit;
    }
    
    $propertyId = intval($_GET['id']);
    
    // Récupérer la propriété par ID
    $stmt = $pdo->prepare("
        SELECT 
            id,
            title,
            description,
            price,
            type,
            surface as area,
            rooms as bedrooms,
            address,
            city,
            status,
            created_at
        FROM properties 
        WHERE id = ?
    ");
    
    $stmt->execute([$propertyId]);
    $property = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($property) {
        // Ajouter des valeurs par défaut pour les champs manquants
        $property['bathrooms'] = $property['bathrooms'] ?? 1;
        $property['image_url'] = $property['image_url'] ?? null;
        
        echo json_encode([
            "success" => true,
            "property" => $property,
            "message" => "Propriété trouvée"
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Propriété non trouvée",
            "property" => null
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage(),
        "property" => null
    ]);
}
?>

