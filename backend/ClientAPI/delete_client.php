<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Gérer les requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "../config/db.php";

// Vérifier la connexion PDO
if (!isset($pdo) || $pdo === null) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erreur de connexion à la base de données"
    ]);
    exit();
}

try {
    // Récupérer et valider les données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception("Données JSON invalides");
    }
    
    // Validation de l'ID
    if (empty($input['id']) || !is_numeric($input['id'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "ID client invalide ou manquant"
        ]);
        exit;
    }
    
    $clientId = (int)$input['id'];
    
    // Vérifier si le client existe avec plus d'informations
    $checkStmt = $pdo->prepare("
        SELECT id, first_name, last_name, email 
        FROM clients 
        WHERE id = ?
    ");
    $checkStmt->execute([$clientId]);
    $client = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$client) {
        http_response_code(404);
        echo json_encode([
            "success" => false, 
            "message" => "Client non trouvé"
        ]);
        exit;
    }

    // Récupérer toutes les données du client pour l'archivage
    $clientDataStmt = $pdo->prepare("SELECT * FROM clients WHERE id = ?");
    $clientDataStmt->execute([$clientId]);
    $clientData = $clientDataStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$clientData) {
        http_response_code(404);
        echo json_encode([
            "success" => false, 
            "message" => "Client non trouvé"
        ]);
        exit;
    }
    
    // Récupérer l'ID de l'utilisateur qui archive (si disponible)
    $archivedBy = null;
    if (!empty($input['archived_by']) && is_numeric($input['archived_by'])) {
        $archivedBy = intval($input['archived_by']);
    } else {
        // Essayer depuis le header Authorization
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                      (isset($headers['authorization']) ? $headers['authorization'] : null);
        if ($authHeader && preg_match('/token_(\d+)/', str_replace('Bearer ', '', $authHeader), $matches)) {
            $archivedBy = intval($matches[1]);
        }
    }
    
    // Démarrer une transaction pour plus de sécurité
    $pdo->beginTransaction();
    
    try {
        // Insérer dans la table d'archivage
        $archiveStmt = $pdo->prepare("
            INSERT INTO archived_clients (
                original_id, civility, first_name, last_name, email, phone, address,
                preferred_type, min_budget, max_budget, preferred_zones, specific_criteria,
                status, acquisition_source, assigned_agent_id, created_at, archived_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $archiveSuccess = $archiveStmt->execute([
            $clientData['id'],
            $clientData['civility'],
            $clientData['first_name'],
            $clientData['last_name'],
            $clientData['email'],
            $clientData['phone'],
            $clientData['address'],
            $clientData['preferred_type'],
            $clientData['min_budget'],
            $clientData['max_budget'],
            $clientData['preferred_zones'],
            $clientData['specific_criteria'],
            $clientData['status'],
            $clientData['acquisition_source'],
            $clientData['assigned_agent_id'],
            $clientData['created_at'],
            $archivedBy
        ]);
        
        if (!$archiveSuccess) {
            throw new Exception("Erreur lors de l'archivage du client");
        }
        
        // SUPPRIMER D'ABORD LES DONNÉES LIÉES dans l'ordre inverse des dépendances
        $tablesToClean = [
            'email_logs',
            'sms_logs', 
            'favorites',
            'appointments',
            'interactions',
            'mandates'
        ];
        
        $deletedCounts = [];
        
        foreach ($tablesToClean as $table) {
            $deleteSql = "DELETE FROM $table WHERE client_id = ?";
            $stmt = $pdo->prepare($deleteSql);
            $stmt->execute([$clientId]);
            $deletedCounts[$table] = $stmt->rowCount();
        }
        
        // Maintenant supprimer le client
        $deleteStmt = $pdo->prepare("DELETE FROM clients WHERE id = ?");
        $success = $deleteStmt->execute([$clientId]);
        
        if ($success && $deleteStmt->rowCount() > 0) {
            $pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "message" => "Client archivé avec succès",
                "archived_client" => [
                    "id" => $clientId,
                    "name" => $client['first_name'] . ' ' . $client['last_name'],
                    "email" => $client['email']
                ],
                "cleaned_data" => $deletedCounts
            ]);
        } else {
            throw new Exception("Aucun client supprimé - ID peut-être invalide");
        }
        
    } catch (Exception $e) {
        $pdo->rollBack();
        throw new Exception("Erreur lors de l'archivage: " . $e->getMessage());
    }
    
} catch (PDOException $e) {
    // Gestion spécifique des erreurs PDO
    error_log("Database error in delete_client: " . $e->getMessage());
    
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Message d'erreur plus clair selon le code d'erreur
    $errorMessage = "Erreur lors de la suppression du client";
    if ($e->getCode() == '23000') {
        $errorMessage = "Impossible de supprimer le client : données liées existent encore. Essayez de supprimer manuellement les données associées.";
    }
    
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => $errorMessage,
        "error_code" => $e->getCode()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>