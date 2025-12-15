<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

include '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!empty($data['email']) && !empty($data['uid'])) {
    $uid = $data['uid'];
    $email = $data['email'];
    $full_name = $data['full_name'] ?? '';
    $photo_url = $data['photo_url'] ?? '';
    $provider = $data['provider'] ?? 'google';
    
    try {
        // Vérifier si l'utilisateur existe déjà
        $stmt = $conn->prepare("SELECT id, full_name, email, role FROM users WHERE email = ? OR uid = ?");
        $stmt->bind_param("ss", $email, $uid);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Utilisateur existe - connexion
            $user = $result->fetch_assoc();
            
            // Mettre à jour les infos si nécessaire
            $update_stmt = $conn->prepare("UPDATE users SET full_name = ?, photo_url = ?, last_login = NOW() WHERE email = ?");
            $update_stmt->bind_param("sss", $full_name, $photo_url, $email);
            $update_stmt->execute();
            
            echo json_encode([
                "success" => true,
                "message" => "Connexion Google réussie!",
                "token" => $uid,
                "user" => [
                    "id" => $user['id'],
                    "full_name" => $full_name ?: $user['full_name'],
                    "email" => $email,
                    "role" => $user['role'],
                    "photo_url" => $photo_url
                ]
            ]);
        } else {
            // Nouvel utilisateur - inscription
            $insert_stmt = $conn->prepare("INSERT INTO users (uid, full_name, email, photo_url, provider, role) VALUES (?, ?, ?, ?, ?, 'agent')");
            $insert_stmt->bind_param("sssss", $uid, $full_name, $email, $photo_url, $provider);
            
            if ($insert_stmt->execute()) {
                echo json_encode([
                    "success" => true,
                    "message" => "Compte créé avec Google!",
                    "token" => $uid,
                    "user" => [
                        "id" => $insert_stmt->insert_id,
                        "full_name" => $full_name,
                        "email" => $email,
                        "role" => "agent",
                        "photo_url" => $photo_url
                    ]
                ]);
            } else {
                echo json_encode([
                    "success" => false,
                    "message" => "Erreur lors de la création du compte"
                ]);
            }
            $insert_stmt->close();
        }
        
        $stmt->close();
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Erreur serveur: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Données Google incomplètes"
    ]);
}

$conn->close();
?>