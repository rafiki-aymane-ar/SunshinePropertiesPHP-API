<?php
/**
 * API de création de propriété
 * Endpoint: POST /backend/PropertyAPI/create_property.php
 * 
 * @package PropertyAPI
 * @version 1.0
 */

// ========================================================================
// CONFIGURATION DES HEADERS CORS ET GESTION D'ERREUR
// ========================================================================
// Désactiver l'affichage des erreurs pour éviter les pages HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Démarrer le buffer de sortie pour capturer toute sortie non désirée
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ========================================================================
// INCLUSION DE LA CONFIGURATION DE BASE DE DONNÉES
// ========================================================================
require_once "../config/db.php";

// ========================================================================
// TRAITEMENT DE LA REQUÊTE
// ========================================================================
try {
    // Vérifier que la méthode est POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode([
            "success" => false, 
            "message" => "Méthode non autorisée. Utilisez POST."
        ]);
        exit;
    }

    // Lire et parser les données JSON
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    // Vérifier que le JSON est valide
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Données JSON invalides: " . json_last_error_msg()
        ]);
        exit;
    }
    
    // Vérifier que les données sont présentes
    if (empty($input)) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Aucune donnée reçue"
        ]);
        exit;
    }
    
    // Vérifier la connexion à la base de données
    if (!isset($pdo) || $pdo === null) {
        http_response_code(500);
        echo json_encode([
            "success" => false, 
            "message" => "Erreur de connexion à la base de données"
        ]);
        exit;
    }
    
    // ========================================================================
    // VALIDATION DES CHAMPS REQUIS
    // ========================================================================
    if (empty($input['title']) || empty($input['price']) || empty($input['city'])) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Le titre, le prix et la ville sont obligatoires"
        ]);
        exit;
    }
    
    // Validation du prix (doit être un nombre positif)
    $price = floatval($input['price']);
    if ($price <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Le prix doit être un nombre positif"
        ]);
        exit;
    }
    
    // Validation de la surface (si fournie, doit être positive)
    $surface = !empty($input['surface']) ? floatval($input['surface']) : null;
    if ($surface !== null && $surface < 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "La surface doit être un nombre positif"
        ]);
        exit;
    }
    
    // Validation du nombre de pièces (si fourni, doit être un entier positif)
    $rooms = !empty($input['rooms']) ? intval($input['rooms']) : null;
    if ($rooms !== null && $rooms < 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Le nombre de pièces doit être un entier positif"
        ]);
        exit;
    }
    
    // ========================================================================
    // RÉCUPÉRATION DE L'UTILISATEUR CRÉATEUR
    // ========================================================================
    // Récupérer l'ID de l'utilisateur depuis les données ou utiliser une valeur par défaut
    $created_by = null;
    
    // Option 1: Depuis les données envoyées (si l'utilisateur est passé depuis le frontend)
    if (!empty($input['created_by']) && is_numeric($input['created_by'])) {
        $created_by = intval($input['created_by']);
    } else {
        // Option 2: Depuis le header Authorization (token)
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : 
                      (isset($headers['authorization']) ? $headers['authorization'] : null);
        
        if ($authHeader) {
            // Extraire le token (format: "Bearer token" ou "token")
            $token = str_replace('Bearer ', '', $authHeader);
            // Si le token contient l'ID utilisateur (format: "token_1")
            if (preg_match('/token_(\d+)/', $token, $matches)) {
                $created_by = intval($matches[1]);
            }
        }
    }
    
    // Option 3: Utiliser l'admin par défaut si aucun utilisateur n'est trouvé
    if (empty($created_by)) {
        // Récupérer le premier admin actif
        $adminStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' AND is_active = true LIMIT 1");
        $adminStmt->execute();
        $admin = $adminStmt->fetch();
        $created_by = $admin ? intval($admin['id']) : 1; // Fallback sur ID 1
    }
    
    // Vérifier que l'utilisateur existe
    $userCheckStmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND is_active = true");
    $userCheckStmt->execute([$created_by]);
    if (!$userCheckStmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            "success" => false, 
            "message" => "Utilisateur créateur invalide ou inactif"
        ]);
        exit;
    }
    
    // ========================================================================
    // PRÉPARATION DE LA REQUÊTE D'INSERTION
    // ========================================================================
    $sql = "INSERT INTO properties (
        title, description, price, type, surface, rooms, 
        address, city, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $pdo->prepare($sql);
    
    // Exécution de la requête avec les valeurs
    $success = $stmt->execute([
        trim($input['title']),
        !empty($input['description']) ? trim($input['description']) : '',
        $price,
        !empty($input['type']) ? $input['type'] : 'appartement',
        $surface,
        $rooms,
        !empty($input['address']) ? trim($input['address']) : '',
        trim($input['city']),
        !empty($input['status']) ? $input['status'] : 'disponible',
        $created_by
    ]);
    
    if ($success) {
        $propertyId = $pdo->lastInsertId();
        
        // Nettoyer le buffer avant d'envoyer la réponse JSON
        ob_clean();
        
        http_response_code(201);
        echo json_encode([
            "success" => true, 
            "message" => "Bien créé avec succès",
            "property_id" => $propertyId
        ]);
        exit;
    } else {
        // Récupérer les erreurs SQL si disponibles
        $errorInfo = $stmt->errorInfo();
        throw new Exception("Erreur lors de l'exécution de la requête SQL: " . ($errorInfo[2] ?? "Erreur inconnue"));
    }
    
} catch (PDOException $e) {
    // Erreur de base de données
    http_response_code(500);
    error_log("Erreur PDO dans create_property.php: " . $e->getMessage());
    
    // S'assurer que seule la réponse JSON est envoyée (pas de HTML)
    ob_clean(); // Nettoyer tout output précédent
    
    echo json_encode([
        "success" => false, 
        "message" => "Erreur de base de données: " . $e->getMessage(),
        "error_code" => $e->getCode()
    ]);
    exit;
} catch (Exception $e) {
    // Autres erreurs
    http_response_code(500);
    error_log("Erreur dans create_property.php: " . $e->getMessage());
    
    // S'assurer que seule la réponse JSON est envoyée (pas de HTML)
    ob_clean(); // Nettoyer tout output précédent
    
    echo json_encode([
        "success" => false, 
        "message" => "Erreur: " . $e->getMessage()
    ]);
    exit;
}
?>