<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require "config/db.php";

// Données du compte test client
$email = "client@test.com";
$password = "client123";
$full_name = "Client Test";
$first_name = "Client";
$last_name = "Test";
$phone = "+33 6 00 00 00 00";

try {
    // Vérifier si le compte existe déjà
    $check = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);
    
    if ($check->fetch()) {
        echo json_encode([
            "success" => true,
            "message" => "Le compte client test existe déjà",
            "credentials" => [
                "email" => $email,
                "password" => $password
            ]
        ]);
        exit;
    }
    
    // Hasher le mot de passe
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Créer l'utilisateur
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password, role, is_active) VALUES (?, ?, ?, ?, 'client', true)");
    $stmt->execute([$full_name, $email, $phone, $hashed_password]);
    $user_id = $pdo->lastInsertId();
    
    // Créer aussi dans la table clients
    $client_stmt = $pdo->prepare("INSERT INTO clients (first_name, last_name, email, phone, status) VALUES (?, ?, ?, ?, 'actif')");
    $client_stmt->execute([$first_name, $last_name, $email, $phone]);
    $client_id = $pdo->lastInsertId();
    
    echo json_encode([
        "success" => true,
        "message" => "Compte client test créé avec succès!",
        "user_id" => $user_id,
        "client_id" => $client_id,
        "credentials" => [
            "email" => $email,
            "password" => $password
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Erreur: " . $e->getMessage()
    ]);
}
?>

