<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db.php';

try {
    // Test de connexion basique
    $test_query = $pdo->query("SELECT 1 as test");
    $test_result = $test_query->fetch();
    
    // Compter les tables
    $counts = [
        'users' => (int)$pdo->query("SELECT COUNT(*) as c FROM users")->fetch()['c'],
        'clients' => (int)$pdo->query("SELECT COUNT(*) as c FROM clients")->fetch()['c'],
        'properties' => (int)$pdo->query("SELECT COUNT(*) as c FROM properties")->fetch()['c'],
        'appointments' => (int)$pdo->query("SELECT COUNT(*) as c FROM appointments")->fetch()['c']
    ];

    echo json_encode([
        'success' => true,
        'database_connection' => 'ok',
        'test_result' => $test_result,
        'table_counts' => $counts,
        'server_time' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>