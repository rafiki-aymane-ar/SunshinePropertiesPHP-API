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
    // Debug: logger le début de la requête
    error_log("📊 Dashboard API appelée - " . date('Y-m-d H:i:s'));

    // 1. STATISTIQUES PRINCIPALES
    // Propriétés totales (disponibles + réservées)
    $properties_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM properties WHERE status IN ('disponible', 'reserve')");
    $properties_stmt->execute();
    $properties_count = (int)$properties_stmt->fetch()['total'];
    error_log("🏠 Propriétés trouvées: " . $properties_count);

    // Rendez-vous AUJOURD'HUI (date du serveur)
    $today = date('Y-m-d');
    $appointments_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_date) = ?");
    $appointments_stmt->execute([$today]);
    $appointments_count = (int)$appointments_stmt->fetch()['total'];
    error_log("📅 Rendez-vous aujourd'hui ($today): " . $appointments_count);

    // Vérifier tous les rendez-vous pour debug
    $all_appointments_stmt = $pdo->prepare("SELECT id, appointment_date, status FROM appointments ORDER BY appointment_date");
    $all_appointments_stmt->execute();
    $all_appointments = $all_appointments_stmt->fetchAll(PDO::FETCH_ASSOC);
    error_log("📋 Tous les rendez-vous: " . json_encode($all_appointments));

    // Clients actifs
    $clients_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM clients WHERE status IN ('actif', 'en_negociation', 'a_qualifier')");
    $clients_stmt->execute();
    $clients_count = (int)$clients_stmt->fetch()['total'];
    error_log("👥 Clients actifs: " . $clients_count);

    // Agents actifs
    $agents_stmt = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE role = 'agent' AND is_active = 1");
    $agents_stmt->execute();
    $agents_count = (int)$agents_stmt->fetch()['total'];
    error_log("👨‍💼 Agents actifs: " . $agents_count);

    // 2. ACTIVITÉS RÉCENTES (récupérées séparément puis fusionnées)
    $recent_activities = [];
    
    try {
        // Nouveaux clients
        $stmt = $pdo->query("SELECT CONCAT('Nouveau client: ', first_name, ' ', last_name) as description, created_at, '👥' as icon, 'new_client' as type FROM clients ORDER BY created_at DESC LIMIT 2");
        $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        
        // Nouveaux biens
        $stmt = $pdo->query("SELECT CONCAT('Nouveau bien: ', title) as description, created_at, '🏠' as icon, 'new_property' as type FROM properties ORDER BY created_at DESC LIMIT 2");
        $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        
        // Rendez-vous
        $stmt = $pdo->query("SELECT CONCAT('RDV planifié: ', DATE_FORMAT(appointment_date, '%d/%m à %H:%i')) as description, created_at, '📅' as icon, 'appointment' as type FROM appointments ORDER BY created_at DESC LIMIT 3");
        $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        
        // Nouveaux agents
        $stmt = $pdo->query("SELECT CONCAT('Nouvel agent: ', full_name) as description, created_at, '👨‍💼' as icon, 'new_agent' as type FROM users WHERE role = 'agent' ORDER BY created_at DESC LIMIT 1");
        $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        
        // Biens archivés (si la table existe)
        try {
            $stmt = $pdo->query("SELECT CONCAT('Bien archivé: ', title) as description, archived_at as created_at, '📦' as icon, 'archived_property' as type FROM archived_properties ORDER BY archived_at DESC LIMIT 3");
            $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            // Table n'existe peut-être pas encore, ignorer
            error_log("Table archived_properties non disponible: " . $e->getMessage());
        }
        
        // Clients archivés (si la table existe)
        try {
            $stmt = $pdo->query("SELECT CONCAT('Client archivé: ', first_name, ' ', last_name) as description, archived_at as created_at, '📦' as icon, 'archived_client' as type FROM archived_clients ORDER BY archived_at DESC LIMIT 2");
            $recent_activities = array_merge($recent_activities, $stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) {
            // Table n'existe peut-être pas encore, ignorer
            error_log("Table archived_clients non disponible: " . $e->getMessage());
        }
        
        // Trier toutes les activités par date (plus récent en premier)
        usort($recent_activities, function($a, $b) {
            $timeA = isset($a['created_at']) ? strtotime($a['created_at']) : 0;
            $timeB = isset($b['created_at']) ? strtotime($b['created_at']) : 0;
            return $timeB - $timeA;
        });
        
        // Prendre les 10 plus récentes
        $recent_activities = array_slice($recent_activities, 0, 10);
        
        // NE JAMAIS retourner d'activité système factice - seulement les vraies activités
        $recent_activities = array_values(array_filter($recent_activities, function($activity) {
            if (!isset($activity['description'])) {
                return false; // Supprimer les activités sans description
            }
            // Supprimer les activités système factices
            return strpos($activity['description'], 'Statistiques mises à jour') === false &&
                   strpos($activity['description'], 'Système en mode démo') === false;
        }));
    } catch (Exception $e) {
        error_log("Erreur récupération activités: " . $e->getMessage());
        $recent_activities = [];
    }

    error_log("📈 Activités récentes trouvées: " . count($recent_activities));

    // 3. RÉPONSE FINALE
    $response = [
        'success' => true,
        'source' => 'database',
        'message' => 'Données réelles chargées avec succès',
        'debug' => [
            'server_date' => $today,
            'total_appointments_in_db' => count($all_appointments),
            'appointments_today_count' => $appointments_count
        ],
        'stats' => [
            'properties' => $properties_count,
            'appointments' => $appointments_count,
            'clients' => $clients_count,
            'agents' => $agents_count
        ],
        'recentActivities' => $recent_activities
    ];

    echo json_encode($response);

} catch (Exception $e) {
    error_log("🚨 ERREUR Dashboard API: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage(),
        'source' => 'error'
    ]);
}
?>