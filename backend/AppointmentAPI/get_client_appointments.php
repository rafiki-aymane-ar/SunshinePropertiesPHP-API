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
    // Récupérer l'ID du client depuis les paramètres ou le token
    $client_id = isset($_GET['client_id']) ? (int)$_GET['client_id'] : null;
    
    if (!$client_id) {
        throw new Exception('ID client requis');
    }
    
    $sql = "
        SELECT 
            a.id,
            a.property_id,
            a.client_id,
            a.agent_id,
            a.appointment_date,
            a.duration_minutes,
            a.meeting_point,
            a.notes,
            a.status,
            a.created_at,
            p.title as property_title,
            p.address as property_address,
            p.city as property_city,
            p.price as property_price,
            p.type as property_type,
            u.full_name as agent_name,
            u.email as agent_email,
            u.phone as agent_phone
        FROM appointments a
        LEFT JOIN properties p ON a.property_id = p.id
        LEFT JOIN users u ON a.agent_id = u.id
        WHERE a.client_id = ?
        ORDER BY a.appointment_date DESC
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$client_id]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Séparer les rendez-vous à venir et passés
    $now = date('Y-m-d H:i:s');
    $upcoming = [];
    $past = [];
    
    foreach ($appointments as $appointment) {
        if ($appointment['appointment_date'] >= $now && $appointment['status'] !== 'cancelled') {
            $upcoming[] = $appointment;
        } else {
            $past[] = $appointment;
        }
    }
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments,
        'upcoming' => $upcoming,
        'past' => $past,
        'total' => count($appointments)
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>

