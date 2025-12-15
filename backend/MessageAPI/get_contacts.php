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
require_once 'user_id_helper.php';

try {
    $user_type = $_GET['user_type'] ?? null;
    $user_input = $_GET['user_id'] ?? null;
    
    if (!$user_type || !$user_input) {
        throw new Exception('user_type et user_id sont requis');
    }
    
    // Obtenir l'ID numérique de la base de données
    $user_id = getUserIdFromInput($user_type, $user_input);
    
    if (!$user_id) {
        throw new Exception('Utilisateur non trouvé dans la base de données.');
    }

    $contacts = [];

    if ($user_type == 'client') {
        // Les clients peuvent contacter les agents
        $stmt = $pdo->query("
            SELECT id, full_name as name, email, phone, role, 'agent' as type
            FROM users 
            WHERE role IN ('agent', 'admin') AND is_active = TRUE
            ORDER BY full_name
        ");
        $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        // Les agents/admins peuvent contacter les clients et autres agents
        $agents_stmt = $pdo->prepare("
            SELECT id, full_name as name, email, phone, role, 'agent' as type
            FROM users 
            WHERE role IN ('agent', 'admin') AND is_active = TRUE AND id != ?
            ORDER BY full_name
        ");
        $agents_stmt->execute([$user_id]);
        $agents = $agents_stmt->fetchAll(PDO::FETCH_ASSOC);

        $clients_stmt = $pdo->query("
            SELECT id, CONCAT(first_name, ' ', last_name) as name, email, phone, 'client' as type
            FROM clients 
            ORDER BY first_name, last_name
        ");
        $clients = $clients_stmt->fetchAll(PDO::FETCH_ASSOC);

        $contacts = [
            'agents' => $agents,
            'clients' => $clients
        ];
    }

    echo json_encode([
        'success' => true,
        'contacts' => $contacts
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>
