<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

try {
    $sql = "
        SELECT 
            a.*,
            c.first_name as client_first_name,
            c.last_name as client_last_name,
            p.title as property_title,
            p.city as property_city,
            u.full_name as agent_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN users u ON a.agent_id = u.id
        ORDER BY a.appointment_date DESC
    ";
    
    $stmt = $pdo->query($sql);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>