<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

include "../../config/db.php";

if (!isset($pdo)) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit;
}

try {
    // Récupérer les activités récentes depuis toutes les tables
    $activities = [];
    
    // 1. Nouvelles interactions (appels, emails, visites)
    $sqlInteractions = "
        SELECT 
            'interaction' as type,
            CONCAT('Contact avec ', c.first_name, ' ', c.last_name, ' - ', i.type) as description,
            i.created_at,
            CASE 
                WHEN i.type = 'appel' THEN '📞'
                WHEN i.type = 'email' THEN '📧'
                WHEN i.type = 'visite' THEN '👀'
                WHEN i.type = 'rappel' THEN '⏰'
                ELSE '📝'
            END as icon
        FROM interactions i
        LEFT JOIN clients c ON i.client_id = c.id
        ORDER BY i.created_at DESC
        LIMIT 10
    ";
    
    $stmt = $pdo->query($sqlInteractions);
    $interactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $interactions);
    
    // 2. Nouveaux clients
    $sqlClients = "
        SELECT 
            'new_client' as type,
            CONCAT('Nouveau client: ', first_name, ' ', last_name) as description,
            created_at,
            '👥' as icon
        FROM clients
        ORDER BY created_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlClients);
    $newClients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $newClients);
    
    // 3. Nouveaux biens
    $sqlProperties = "
        SELECT 
            'new_property' as type,
            CONCAT('Nouveau bien: ', title) as description,
            created_at,
            '🏠' as icon
        FROM properties
        ORDER BY created_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlProperties);
    $newProperties = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $newProperties);
    
    // 4. Rendez-vous
    $sqlAppointments = "
        SELECT 
            'appointment' as type,
            CONCAT('RDV avec ', c.first_name, ' ', c.last_name, ' pour ', p.title) as description,
            a.created_at,
            '📅' as icon
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN properties p ON a.property_id = p.id
        ORDER BY a.created_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlAppointments);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $appointments);
    
    // 5. Mandats signés
    $sqlMandates = "
        SELECT 
            'contract' as type,
            CONCAT('Mandat signé: ', p.title) as description,
            m.created_at,
            '📝' as icon
        FROM mandates m
        LEFT JOIN properties p ON m.property_id = p.id
        ORDER BY m.created_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlMandates);
    $mandates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $mandates);
    
    // 6. Biens archivés
    $sqlArchivedProperties = "
        SELECT 
            'archived_property' as type,
            CONCAT('Bien archivé: ', title) as description,
            archived_at as created_at,
            '📦' as icon
        FROM archived_properties
        ORDER BY archived_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlArchivedProperties);
    $archivedProperties = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $archivedProperties);
    
    // 7. Clients archivés
    $sqlArchivedClients = "
        SELECT 
            'archived_client' as type,
            CONCAT('Client archivé: ', first_name, ' ', last_name) as description,
            archived_at as created_at,
            '📦' as icon
        FROM archived_clients
        ORDER BY archived_at DESC
        LIMIT 5
    ";
    
    $stmt = $pdo->query($sqlArchivedClients);
    $archivedClients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = array_merge($activities, $archivedClients);
    
    // Trier toutes les activités par date (plus récent en premier)
    usort($activities, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    // Prendre les 10 plus récentes
    $recentActivities = array_slice($activities, 0, 10);
    
    echo json_encode([
        "success" => true,
        "recentActivities" => $recentActivities,
        "totalActivities" => count($recentActivities),
        "source" => "database"
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "message" => "Database error: " . $e->getMessage()
    ]);
}
?>