<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db.php';

try {
    // Récupérer tous les utilisateurs actifs
    $sql = "SELECT id, full_name, email, role, is_active FROM users WHERE is_active = true ORDER BY full_name";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Récupérer seulement les agents
    $sqlAgents = "SELECT id, full_name, email, role, is_active FROM users WHERE role = 'agent' AND is_active = true ORDER BY full_name";
    $stmtAgents = $pdo->prepare($sqlAgents);
    $stmtAgents->execute();
    $agents = $stmtAgents->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'all_users' => $users,
        'agents_only' => $agents,
        'count_all_users' => count($users),
        'count_agents' => count($agents)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>