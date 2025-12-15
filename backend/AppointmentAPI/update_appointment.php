<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

try {
    if (empty($input['id'])) {
        throw new Exception('ID du rendez-vous manquant');
    }
    
    $sql = "UPDATE appointments SET 
            property_id = ?, 
            client_id = ?, 
            agent_id = ?, 
            appointment_date = ?, 
            duration_minutes = ?, 
            meeting_point = ?, 
            notes = ?, 
            status = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $success = $stmt->execute([
        $input['property_id'],
        $input['client_id'],
        $input['agent_id'],
        $input['appointment_date'],
        $input['duration_minutes'],
        $input['meeting_point'],
        $input['notes'],
        $input['status'],
        $input['id']
    ]);
    
    if ($success && $stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Rendez-vous modifié avec succès'
        ]);
    } else {
        throw new Exception('Aucun rendez-vous trouvé ou aucune modification');
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur: ' . $e->getMessage()
    ]);
}
?>