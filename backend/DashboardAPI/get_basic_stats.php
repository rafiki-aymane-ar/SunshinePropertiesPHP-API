<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

try {
    // Statistiques réelles depuis la base de données
    $properties_count = (int)$pdo->query("SELECT COUNT(*) as c FROM properties")->fetch()['c'];
    $appointments_count = (int)$pdo->query("SELECT COUNT(*) as c FROM appointments")->fetch()['c'];
    $clients_count = (int)$pdo->query("SELECT COUNT(*) as c FROM clients")->fetch()['c'];
    $agents_count = (int)$pdo->query("SELECT COUNT(*) as c FROM users WHERE role = 'agent' AND is_active = 1")->fetch()['c'];
    
    // Transactions réussies (propriétés vendues ou réservées)
    $sales_count = (int)$pdo->query("SELECT COUNT(*) as c FROM properties WHERE status IN ('vendu', 'reserve')")->fetch()['c'];
    
    $stats = [
        'properties' => $properties_count,
        'appointments' => $appointments_count,
        'clients' => $clients_count,
        'agents' => $agents_count,
        'sales' => $sales_count
    ];

    // Récupérer les activités récentes (y compris les archivages)
    $recentActivities = [];
    $debug_info = [];
    
    try {
        // Nouveaux clients
        $stmt = $pdo->query("SELECT CONCAT('Nouveau client: ', first_name, ' ', last_name) as description, created_at, '👥' as icon, 'new_client' as type FROM clients ORDER BY created_at DESC LIMIT 2");
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $recentActivities = array_merge($recentActivities, $clients);
        $debug_info['clients'] = count($clients);
        
        // Nouveaux biens
        $stmt = $pdo->query("SELECT CONCAT('Nouveau bien: ', title) as description, created_at, '🏠' as icon, 'new_property' as type FROM properties ORDER BY created_at DESC LIMIT 2");
        $properties = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $recentActivities = array_merge($recentActivities, $properties);
        $debug_info['properties'] = count($properties);
        
        // Rendez-vous
        $stmt = $pdo->query("SELECT CONCAT('RDV planifié: ', DATE_FORMAT(appointment_date, '%d/%m à %H:%i')) as description, created_at, '📅' as icon, 'appointment' as type FROM appointments ORDER BY created_at DESC LIMIT 3");
        $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $recentActivities = array_merge($recentActivities, $appointments);
        $debug_info['appointments'] = count($appointments);
        
        // Biens archivés (si la table existe)
        try {
            $stmt = $pdo->query("SELECT CONCAT('Bien archivé: ', title) as description, archived_at as created_at, '📦' as icon, 'archived_property' as type FROM archived_properties ORDER BY archived_at DESC LIMIT 3");
            $archivedProps = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $recentActivities = array_merge($recentActivities, $archivedProps);
            $debug_info['archived_properties'] = count($archivedProps);
            $debug_info['archived_properties_data'] = $archivedProps; // Pour debug
            error_log("✅ Biens archivés trouvés: " . count($archivedProps) . " - " . json_encode($archivedProps));
        } catch (PDOException $e) {
            // Table n'existe peut-être pas encore, ignorer
            $debug_info['archived_properties_error'] = $e->getMessage();
            error_log("❌ Table archived_properties non disponible: " . $e->getMessage());
        }
        
        // Clients archivés (si la table existe)
        try {
            $stmt = $pdo->query("SELECT CONCAT('Client archivé: ', first_name, ' ', last_name) as description, archived_at as created_at, '📦' as icon, 'archived_client' as type FROM archived_clients ORDER BY archived_at DESC LIMIT 2");
            $archivedClients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $recentActivities = array_merge($recentActivities, $archivedClients);
            $debug_info['archived_clients'] = count($archivedClients);
            $debug_info['archived_clients_data'] = $archivedClients; // Pour debug
            error_log("✅ Clients archivés trouvés: " . count($archivedClients) . " - " . json_encode($archivedClients));
        } catch (PDOException $e) {
            // Table n'existe peut-être pas encore, ignorer
            $debug_info['archived_clients_error'] = $e->getMessage();
            error_log("❌ Table archived_clients non disponible: " . $e->getMessage());
        }
        
        // Trier par date
        usort($recentActivities, function($a, $b) {
            $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
            $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
            return $timeB - $timeA;
        });
        
        // Prendre les 10 plus récentes
        $recentActivities = array_slice($recentActivities, 0, 10);
        
        // NE JAMAIS retourner d'activité système factice - seulement les vraies activités
        // Si aucune activité n'est trouvée, retourner un tableau vide
        error_log("📊 Total activités récupérées: " . count($recentActivities) . " - Debug: " . json_encode($debug_info));
        
        // Vérifier qu'aucune activité système factice n'est présente et réindexer
        $recentActivities = array_values(array_filter($recentActivities, function($activity) {
            if (!isset($activity['description'])) {
                return false; // Supprimer les activités sans description
            }
            // Supprimer les activités système factices
            return strpos($activity['description'], 'Statistiques mises à jour') === false &&
                   strpos($activity['description'], 'Système en mode démo') === false;
        }));
    } catch (Exception $e) {
        error_log("❌ Erreur récupération activités: " . $e->getMessage());
        $recentActivities = [];
    }
    
    // Format de compatibilité pour le frontend
    $response = [
        'success' => true,
        'source' => 'database',
        'stats' => $stats,
        // Format alternatif pour compatibilité
        'total_properties' => $properties_count,
        'total_agents' => $agents_count,
        'total_clients' => $clients_count,
        'total_sales' => $sales_count,
        'recentActivities' => $recentActivities,
        'message' => 'Statistiques réelles chargées depuis la base de données',
        'debug' => [
            'activities_count' => count($recentActivities),
            'debug_info' => $debug_info ?? []
        ]
    ];

    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>