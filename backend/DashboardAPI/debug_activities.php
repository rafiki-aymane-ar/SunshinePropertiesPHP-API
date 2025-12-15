<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$debug = [
    'timestamp' => date('Y-m-d H:i:s'),
    'tables_check' => [],
    'activities_found' => []
];

try {
    // Vérifier si les tables existent
    $tables = ['clients', 'properties', 'appointments', 'archived_properties', 'archived_clients'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $debug['tables_check'][$table] = [
                'exists' => true,
                'count' => (int)$count
            ];
        } catch (PDOException $e) {
            $debug['tables_check'][$table] = [
                'exists' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    // Récupérer les activités récentes
    $activities = [];
    
    // Clients
    try {
        $stmt = $pdo->query("SELECT CONCAT('Nouveau client: ', first_name, ' ', last_name) as description, created_at, '👥' as icon, 'new_client' as type FROM clients ORDER BY created_at DESC LIMIT 2");
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $clients);
        $debug['activities_found']['clients'] = count($clients);
    } catch (Exception $e) {
        $debug['activities_found']['clients_error'] = $e->getMessage();
    }
    
    // Propriétés
    try {
        $stmt = $pdo->query("SELECT CONCAT('Nouveau bien: ', title) as description, created_at, '🏠' as icon, 'new_property' as type FROM properties ORDER BY created_at DESC LIMIT 2");
        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $properties);
        $debug['activities_found']['properties'] = count($properties);
    } catch (Exception $e) {
        $debug['activities_found']['properties_error'] = $e->getMessage();
    }
    
    // Rendez-vous
    try {
        $stmt = $pdo->query("SELECT CONCAT('RDV planifié: ', DATE_FORMAT(appointment_date, '%d/%m à %H:%i')) as description, created_at, '📅' as icon, 'appointment' as type FROM appointments ORDER BY created_at DESC LIMIT 3");
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $appointments);
        $debug['activities_found']['appointments'] = count($appointments);
    } catch (Exception $e) {
        $debug['activities_found']['appointments_error'] = $e->getMessage();
    }
    
    // Biens archivés
    try {
        $stmt = $pdo->query("SELECT CONCAT('Bien archivé: ', title) as description, archived_at as created_at, '📦' as icon, 'archived_property' as type FROM archived_properties ORDER BY archived_at DESC LIMIT 5");
        $archivedProps = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $archivedProps);
        $debug['activities_found']['archived_properties'] = count($archivedProps);
        $debug['activities_found']['archived_properties_data'] = $archivedProps;
    } catch (PDOException $e) {
        $debug['activities_found']['archived_properties_error'] = $e->getMessage();
    }
    
    // Clients archivés
    try {
        $stmt = $pdo->query("SELECT CONCAT('Client archivé: ', first_name, ' ', last_name) as description, archived_at as created_at, '📦' as icon, 'archived_client' as type FROM archived_clients ORDER BY archived_at DESC LIMIT 5");
        $archivedClients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $archivedClients);
        $debug['activities_found']['archived_clients'] = count($archivedClients);
        $debug['activities_found']['archived_clients_data'] = $archivedClients;
    } catch (PDOException $e) {
        $debug['activities_found']['archived_clients_error'] = $e->getMessage();
    }
    
    // Trier
    usort($activities, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });
    
    $activities = array_slice($activities, 0, 10);
    
    $debug['total_activities'] = count($activities);
    $debug['activities'] = $activities;
    
    echo json_encode([
        'success' => true,
        'debug' => $debug
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'debug' => $debug
    ], JSON_PRETTY_PRINT);
}
?>

