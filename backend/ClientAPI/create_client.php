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
    
    // Validation des champs obligatoires
    $requiredFields = ['first_name', 'last_name'];
    foreach ($requiredFields as $field) {
        if (empty(trim($input[$field] ?? ''))) {
            throw new Exception("Le champ '$field' est obligatoire");
        }
    }
    
    // Nettoyage et validation des données
    $civility = in_array($input['civility'] ?? '', ['M', 'Mme']) ? $input['civility'] : 'M';
    $firstName = trim($input['first_name']);
    $lastName = trim($input['last_name']);
    $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL) ? $input['email'] : null;
    $phone = preg_replace('/[^0-9+]/', '', $input['phone'] ?? '');
    $preferredType = in_array($input['preferred_type'] ?? '', ['appartement','maison','villa','bureau','terrain']) ? $input['preferred_type'] : null;
    $status = in_array($input['status'] ?? '', ['nouveau','a_qualifier','actif','en_negociation','client','inactif']) ? $input['status'] : 'nouveau';
    $acquisitionSource = in_array($input['acquisition_source'] ?? '', ['site_web','recommandation','reseau_social','annonce','salon','autre']) ? $input['acquisition_source'] : 'site_web';
    
    // Validation des budgets
    $minBudget = isset($input['min_budget']) ? floatval($input['min_budget']) : null;
    $maxBudget = isset($input['max_budget']) ? floatval($input['max_budget']) : null;
    
    if ($minBudget !== null && $minBudget < 0) {
        throw new Exception("Le budget minimum ne peut pas être négatif");
    }
    
    if ($maxBudget !== null && $maxBudget < 0) {
        throw new Exception("Le budget maximum ne peut pas être négatif");
    }
    
    if ($minBudget !== null && $maxBudget !== null && $minBudget > $maxBudget) {
        throw new Exception("Le budget minimum ne peut pas être supérieur au budget maximum");
    }
    
    // Vérifier si l'email existe déjà
    if ($email) {
        $checkEmailStmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
        $checkEmailStmt->execute([$email]);
        if ($checkEmailStmt->fetch()) {
            throw new Exception("Un client avec cet email existe déjà");
        }
    }
    
    // Préparer la requête d'insertion
    $sql = "INSERT INTO clients (
        civility, first_name, last_name, email, phone, address, 
        preferred_type, min_budget, max_budget, preferred_zones, 
        specific_criteria, status, acquisition_source, assigned_agent_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
    $success = $stmt->execute([
        $civility,
        $firstName,
        $lastName,
        $email,
        !empty($phone) ? $phone : null,
        !empty($input['address']) ? trim($input['address']) : null,
        $preferredType,
        $minBudget,
        $maxBudget,
        !empty($input['preferred_zones']) ? trim($input['preferred_zones']) : null,
        !empty($input['specific_criteria']) ? trim($input['specific_criteria']) : null,
        $status,
        $acquisitionSource,
        !empty($input['assigned_agent_id']) ? intval($input['assigned_agent_id']) : null
    ]);
    
    if ($success) {
        $clientId = $pdo->lastInsertId();
        
        // Récupérer les données du client créé
        $clientStmt = $pdo->prepare("
            SELECT id, civility, first_name, last_name, email, phone, address,
                   preferred_type, min_budget, max_budget, preferred_zones,
                   specific_criteria, status, acquisition_source, assigned_agent_id,
                   created_at
            FROM clients 
            WHERE id = ?
        ");
        $clientStmt->execute([$clientId]);
        $client = $clientStmt->fetch(PDO::FETCH_ASSOC);
        
        http_response_code(201);
        echo json_encode([
            "success" => true, 
            "message" => "Client créé avec succès",
            "client_id" => $clientId,
            "client" => $client
        ]);
        
    } else {
        throw new Exception("Échec de la création du client");
    }
    
} catch (PDOException $e) {
    error_log("Database error in create_client: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Erreur base de données: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false, 
        "message" => $e->getMessage()
    ]);
}
?>