<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

// Récupérer les données JSON
$input = json_decode(file_get_contents('php://input'), true);

// Debug: logger les données reçues
error_log("Données reçues: " . print_r($input, true));

try {
    // Validation basique
    if (empty($input['property_id']) || empty($input['client_id']) || empty($input['agent_id']) || empty($input['appointment_date'])) {
        throw new Exception('Tous les champs obligatoires doivent être remplis');
    }

    // Convertir les IDs en entiers
    $property_id = (int)$input['property_id'];
    $client_id = (int)$input['client_id'];
    $agent_id = (int)$input['agent_id'];

    // Vérifier que les IDs sont valides
    if ($property_id <= 0 || $client_id <= 0 || $agent_id <= 0) {
        throw new Exception('IDs invalides');
    }

    // Vérifier l'existence des données (optionnel - pour debug)
    $check_agent = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'agent' AND is_active = true");
    $check_agent->execute([$agent_id]);
    if (!$check_agent->fetch()) {
        throw new Exception("Agent ID $agent_id non trouvé ou inactif");
    }

    $check_client = $pdo->prepare("SELECT id FROM clients WHERE id = ?");
    $check_client->execute([$client_id]);
    if (!$check_client->fetch()) {
        throw new Exception("Client ID $client_id non trouvé");
    }

    $check_property = $pdo->prepare("SELECT id FROM properties WHERE id = ?");
    $check_property->execute([$property_id]);
    if (!$check_property->fetch()) {
        throw new Exception("Propriété ID $property_id non trouvée");
    }

    // Préparer l'insertion
    $sql = "INSERT INTO appointments (property_id, client_id, agent_id, appointment_date, duration_minutes, meeting_point, notes, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
    $success = $stmt->execute([
        $property_id,
        $client_id,
        $agent_id,
        $input['appointment_date'],
        $input['duration_minutes'] ?? 60,
        $input['meeting_point'] ?? '',
        $input['notes'] ?? '',
        $input['status'] ?? 'scheduled'
    ]);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Rendez-vous créé avec succès',
            'appointment_id' => $pdo->lastInsertId(),
            'data_sent' => [
                'property_id' => $property_id,
                'client_id' => $client_id,
                'agent_id' => $agent_id,
                'appointment_date' => $input['appointment_date']
            ]
        ]);
    } else {
        throw new Exception('Erreur lors de l\'insertion en base de données');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage(),
        'received_data' => $input
    ]);
}
?>