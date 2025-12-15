<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db.php';

try {
    // Récupérer tous les agents actifs
    $agents_stmt = $pdo->prepare("
        SELECT id, full_name, email, role, is_active 
        FROM users 
        WHERE role = 'agent' AND is_active = true 
        ORDER BY id
    ");
    $agents_stmt->execute();
    $agents = $agents_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer tous les clients
    $clients_stmt = $pdo->prepare("
        SELECT id, civility, first_name, last_name, email 
        FROM clients 
        ORDER BY id
    ");
    $clients_stmt->execute();
    $clients = $clients_stmt->fetchAll(PDO::FETCH_ASSOC);

    // Récupérer toutes les propriétés disponibles
    $properties_stmt = $pdo->prepare("
        SELECT id, title, city, price, status 
        FROM properties 
        WHERE status = 'disponible' 
        ORDER BY id
    ");
    $properties_stmt->execute();
    $properties = $properties_stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'agents' => $agents,
        'clients' => $clients,
        'properties' => $properties,
        'counts' => [
            'agents' => count($agents),
            'clients' => count($clients),
            'properties' => count($properties)
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>