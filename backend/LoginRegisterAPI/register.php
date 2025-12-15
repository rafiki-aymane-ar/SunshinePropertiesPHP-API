<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

require "../config/db.php";

// Vérifier la connexion PDO
if (!isset($pdo) || $pdo === null) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur de connexion à la base de données"
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Données JSON invalides"]);
    exit();
}

$first_name = $data["first_name"] ?? '';
$last_name = $data["last_name"] ?? '';
$email = $data["email"] ?? '';
$phone = $data["phone"] ?? '';
$password = $data["password"] ?? '';

// Validation des champs obligatoires
if (empty($first_name) || empty($last_name) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Tous les champs obligatoires doivent être remplis"]);
    exit();
}

// Validation de l'email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Email invalide"]);
    exit();
}

try {
    // Vérifier si l'email existe déjà dans la table users
    $check_stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check_stmt->execute([$email]);
    $existing_user = $check_stmt->fetch();
    
    if ($existing_user) {
        echo json_encode(["success" => false, "message" => "Cet email est déjà utilisé"]);
        exit();
    }
    
    // Hasher le mot de passe
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Combiner first_name et last_name pour full_name
    $full_name = trim($first_name . ' ' . $last_name);
    
    // Démarrer une transaction pour garantir l'intégrité des données
    $pdo->beginTransaction();
    
    try {
        // 1. Insérer dans la table users
        $user_sql = "INSERT INTO users (full_name, email, phone, password, role) 
                     VALUES (?, ?, ?, ?, 'client')";
        $user_stmt = $pdo->prepare($user_sql);
        $user_stmt->execute([$full_name, $email, $phone, $hashed_password]);
        
        $user_id = $pdo->lastInsertId();
        
        // 2. Insérer dans la table clients (seulement si l'email n'existe pas)
        $check_client_stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
        $check_client_stmt->execute([$email]);
        $existing_client = $check_client_stmt->fetch();
        
        if (!$existing_client) {
            // L'email n'existe pas dans clients, on peut insérer
            $client_sql = "INSERT INTO clients (first_name, last_name, email, phone, status) 
                           VALUES (?, ?, ?, ?, 'actif')";
            $client_stmt = $pdo->prepare($client_sql);
            $client_stmt->execute([$first_name, $last_name, $email, $phone]);
        }
        
        // Valider la transaction
        $pdo->commit();
        
        echo json_encode([
            "success" => true, 
            "message" => "Compte créé avec succès!",
            "user_id" => $user_id
        ]);
        
    } catch (Exception $e) {
        // Annuler la transaction en cas d'erreur
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        throw $e;
    }
    
} catch (PDOException $e) {
    http_response_code(400);
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
