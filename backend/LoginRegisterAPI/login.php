<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Gérer les requêtes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

include '../config/db.php';

// Vérifier la connexion PDO
if (!isset($pdo) || $pdo === null) {
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed"
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        "success" => false,
        "message" => "Invalid JSON data"
    ]);
    exit();
}

if (!empty($data['email']) && !empty($data['password'])) {
    $email = trim($data['email']);
    $password = $data['password'];
    
    try {
        // Utilisation de PDO
        $stmt = $pdo->prepare("SELECT id, full_name, email, password, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user) {
            // Vérification du mot de passe
            if (password_verify($password, $user['password'])) {
                // Récupérer le client_id si c'est un client
                $client_id = null;
                if ($user['role'] === 'client') {
                    $client_stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ?");
                    $client_stmt->execute([$email]);
                    $client = $client_stmt->fetch();
                    if ($client) {
                        $client_id = $client['id'];
                    }
                }
                
                echo json_encode([
                    "success" => true,
                    "message" => "Connexion réussie!",
                    "token" => "token_" . $user['id'],
                    "user" => [
                        "id" => $user['id'],
                        "full_name" => $user['full_name'],
                        "email" => $user['email'],
                        "role" => $user['role'],
                        "client_id" => $client_id
                    ]
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Mot de passe incorrect"
                ]);
            }
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Utilisateur non trouvé"
            ]);
        }
        
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        echo json_encode([
            "success" => false,
            "message" => "Erreur serveur"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Tous les champs sont requis"
    ]);
}

// Fermer la connexion PDO (optionnel, se ferme automatiquement à la fin du script)
$pdo = null;
?>