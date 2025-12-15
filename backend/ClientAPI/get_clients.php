<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Inclure la configuration DB (PDO)
include "../config/db.php";

try {
    // Vérifier si la connexion PDO existe
    if (!isset($pdo)) {
        throw new Exception("Connexion base de données non disponible");
    }
    
    // Récupérer tous les clients
    $stmt = $pdo->query("SELECT * FROM clients ORDER BY created_at DESC");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "clients" => $clients,
        "count" => count($clients)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>  