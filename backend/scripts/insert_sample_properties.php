<?php
/**
 * Script PHP pour insérer des propriétés de test dans la base de données
 * 
 * Ce script peut être exécuté via navigateur ou ligne de commande
 * URL: http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/scripts/insert_sample_properties.php
 * 
 * @package Scripts
 * @version 1.0
 */

// Configuration
require_once '../config/db.php';

// Headers pour le navigateur
header("Content-Type: text/html; charset=UTF-8");

// Fonction pour formater les messages
function formatMessage($message, $type = 'info') {
    $colors = [
        'success' => '#28a745',
        'error' => '#dc3545',
        'info' => '#17a2b8',
        'warning' => '#ffc107'
    ];
    $color = $colors[$type] ?? $colors['info'];
    return "<div style='padding: 10px; margin: 5px 0; background: #f8f9fa; border-left: 4px solid {$color};'>" . htmlspecialchars($message) . "</div>";
}

echo "<!DOCTYPE html>
<html>
<head>
    <title>Insertion de propriétés de test</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        h1 { color: #333; }
        .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Insertion de propriétés de test</h1>";

try {
    // Vérifier la connexion
    if (!isset($pdo) || $pdo === null) {
        throw new Exception("Erreur de connexion à la base de données");
    }
    
    echo formatMessage("Connexion à la base de données réussie", 'success');
    
    // Vérifier qu'il existe au moins un utilisateur admin
    $adminCheck = $pdo->query("SELECT id FROM users WHERE role = 'admin' AND is_active = true LIMIT 1");
    $admin = $adminCheck->fetch(PDO::FETCH_ASSOC);
    
    if (!$admin) {
        throw new Exception("Aucun administrateur actif trouvé. Veuillez créer un admin d'abord.");
    }
    
    $created_by = $admin['id'];
    echo formatMessage("Utilisateur créateur trouvé (ID: {$created_by})", 'info');
    
    // Liste des propriétés à insérer
    $properties = [
        // APPARTEMENTS PARIS
        ['Studio cosy dans le Marais', 'Studio rénové de 25m² dans le quartier historique du Marais. Parfait pour étudiant ou jeune actif. Proche transports.', 180000, 'appartement', 25, 1, '15 Rue des Rosiers', 'Paris', 'disponible'],
        ['Appartement 2 pièces Montmartre', 'Charmant appartement de 45m² avec balcon. Vue sur les toits de Paris. Proche métro et commerces.', 320000, 'appartement', 45, 2, '22 Rue Lepic', 'Paris', 'disponible'],
        ['Appartement 3 pièces République', 'Appartement lumineux de 65m² avec balcon. Séjour spacieux, cuisine équipée. Proche République.', 450000, 'appartement', 65, 3, '8 Boulevard Voltaire', 'Paris', 'disponible'],
        ['Appartement 4 pièces Trocadéro', 'Grand appartement de 95m² avec vue sur la Tour Eiffel. Parquet, hauts plafonds. Standing.', 750000, 'appartement', 95, 4, '12 Avenue Kléber', 'Paris', 'disponible'],
        
        // APPARTEMENTS LYON
        ['Studio moderne Confluence', 'Studio neuf de 28m² dans le quartier Confluence. Vue sur la Saône. Parking disponible.', 165000, 'appartement', 28, 1, '45 Quai Rambaud', 'Lyon', 'disponible'],
        ['Appartement 2 pièces Presqu\'île', 'Appartement de 50m² dans le cœur de Lyon. Proche commerces et transports. Rénové en 2023.', 280000, 'appartement', 50, 2, '18 Rue de la République', 'Lyon', 'disponible'],
        ['Appartement 3 pièces Part-Dieu', 'Appartement de 70m² proche de la Part-Dieu. Balcon, parking. Idéal famille.', 380000, 'appartement', 70, 3, '25 Boulevard Vivier Merle', 'Lyon', 'disponible'],
        
        // APPARTEMENTS MARSEILLE
        ['Studio Vieux-Port', 'Studio de 22m² avec vue sur le Vieux-Port. Proche plages et commerces. Idéal investissement.', 120000, 'appartement', 22, 1, '10 Quai du Port', 'Marseille', 'disponible'],
        ['Appartement 2 pièces Canebière', 'Appartement de 48m² rénové. Proche Canebière et métro. Lumineux et calme.', 195000, 'appartement', 48, 2, '35 La Canebière', 'Marseille', 'disponible'],
        ['Appartement 3 pièces Prado', 'Appartement de 75m² proche plages du Prado. Terrasse, parking. Vue mer.', 420000, 'appartement', 75, 3, '88 Avenue du Prado', 'Marseille', 'disponible'],
        
        // MAISONS BORDEAUX
        ['Maison 4 pièces Chartrons', 'Maison de 110m² avec jardin. Quartier Chartrons. Rénovée, garage. Proche centre-ville.', 420000, 'maison', 110, 4, '12 Rue Notre-Dame', 'Bordeaux', 'disponible'],
        ['Maison 5 pièces Caudéran', 'Maison de 140m² avec piscine. Quartier résidentiel. Jardin 500m². Idéal famille.', 580000, 'maison', 140, 5, '45 Avenue de la Libération', 'Bordeaux', 'disponible'],
        
        // MAISONS TOULOUSE
        ['Maison 3 pièces Capitole', 'Maison de 85m² avec terrasse. Proche Capitole. Rénovée, charme ancien.', 285000, 'maison', 85, 3, '18 Rue des Filatiers', 'Toulouse', 'disponible'],
        ['Maison 4 pièces Purpan', 'Maison de 120m² avec jardin. Quartier Purpan. Garage, double vitrage.', 380000, 'maison', 120, 4, '32 Rue de Purpan', 'Toulouse', 'disponible'],
        
        // MAISONS NICE
        ['Maison 3 pièces Cimiez', 'Maison de 90m² avec vue mer. Quartier Cimiez. Terrasse, parking.', 450000, 'maison', 90, 3, '25 Avenue de Cimiez', 'Nice', 'disponible'],
        ['Maison 5 pièces Mont Boron', 'Maison de 160m² avec piscine et vue panoramique. Jardin 600m². Standing.', 720000, 'maison', 160, 5, '88 Chemin de Mont Boron', 'Nice', 'disponible'],
        
        // VILLAS
        ['Villa moderne avec piscine', 'Villa de 200m² avec piscine et jardin 800m². 5 chambres, vue mer. Proche plages.', 850000, 'villa', 200, 5, '120 Promenade des Anglais', 'Nice', 'disponible'],
        ['Villa luxe Cap d\'Antibes', 'Villa de 280m² avec piscine chauffée. 6 chambres, jardin 1000m². Vue exceptionnelle.', 1200000, 'villa', 280, 6, '45 Boulevard du Cap', 'Nice', 'disponible'],
        ['Villa contemporaine', 'Villa de 180m² avec piscine. 4 chambres, jardin 600m². Proche centre-ville.', 650000, 'villa', 180, 4, '78 Avenue de la Marne', 'Bordeaux', 'disponible'],
        
        // TERRAINS
        ['Terrain constructible 500m²', 'Terrain constructible de 500m². Viabilisé, permis de construire possible. Proche centre.', 95000, 'terrain', 500, null, 'Chemin des Vignes', 'Lyon', 'disponible'],
        ['Terrain constructible 800m²', 'Terrain de 800m² avec vue. Viabilisé, eau, électricité. Idéal construction villa.', 145000, 'terrain', 800, null, 'Route de la Plaine', 'Marseille', 'disponible'],
        ['Terrain constructible 1000m²', 'Grand terrain de 1000m². Viabilisé, pente douce. Vue panoramique.', 180000, 'terrain', 1000, null, 'Avenue des Collines', 'Toulouse', 'disponible'],
        
        // BUREAUX
        ['Bureau 50m² La Défense', 'Bureau de 50m² dans immeuble moderne. Climatisation, ascenseur. Proche transports.', 320000, 'bureau', 50, null, '15 Place de la Défense', 'Paris', 'disponible'],
        ['Bureau 80m² Opéra', 'Bureau de 80m² proche Opéra. Rénové, lumineux. Idéal cabinet professionnel.', 480000, 'bureau', 80, null, '22 Boulevard des Capucines', 'Paris', 'disponible'],
        ['Bureau 60m² Part-Dieu', 'Bureau de 60m² dans tour Part-Dieu. Vue panoramique. Parking disponible.', 280000, 'bureau', 60, null, '30 Boulevard Vivier Merle', 'Lyon', 'disponible'],
        ['Local commercial 40m²', 'Local commercial de 40m² en rez-de-chaussée. Vitrine, stockage. Proche commerces.', 195000, 'bureau', 40, null, '55 Rue de la République', 'Lyon', 'disponible'],
        ['Bureau 70m² Vieux-Port', 'Bureau de 70m² avec vue port. Rénové, climatisé. Proche centre-ville.', 350000, 'bureau', 70, null, '18 Quai des Belges', 'Marseille', 'disponible'],
        
        // PROPRIÉTÉS VARIÉES
        ['Appartement 2 pièces Bordeaux', 'Appartement de 55m² avec balcon. Quartier Saint-Michel. Rénové, lumineux.', 245000, 'appartement', 55, 2, '28 Rue Saint-Michel', 'Bordeaux', 'disponible'],
        ['Appartement 3 pièces Toulouse', 'Appartement de 68m² avec terrasse. Proche Capitole. Parquet, hauts plafonds.', 295000, 'appartement', 68, 3, '42 Rue Alsace-Lorraine', 'Toulouse', 'disponible'],
        ['Appartement 1 pièce Nice', 'Studio de 30m² avec balcon. Proche plages. Rénové, mezzanine possible.', 185000, 'appartement', 30, 1, '15 Rue de France', 'Nice', 'disponible'],
    ];
    
    // Préparer la requête
    $sql = "INSERT INTO properties (
        title, description, price, type, surface, rooms, 
        address, city, status, created_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $stmt = $pdo->prepare($sql);
    
    $inserted = 0;
    $errors = [];
    
    // Insérer chaque propriété
    foreach ($properties as $index => $prop) {
        try {
            $success = $stmt->execute([
                $prop[0], // title
                $prop[1], // description
                $prop[2], // price
                $prop[3], // type
                $prop[4], // surface
                $prop[5], // rooms
                $prop[6], // address
                $prop[7], // city
                $prop[8], // status
                $created_by
            ]);
            
            if ($success) {
                $inserted++;
                echo formatMessage("✓ {$prop[0]} - {$prop[7]} ({$prop[3]})", 'success');
            } else {
                $errors[] = "Erreur lors de l'insertion de: {$prop[0]}";
            }
        } catch (PDOException $e) {
            $errors[] = "Erreur pour {$prop[0]}: " . $e->getMessage();
        }
    }
    
    // Afficher le résumé
    echo "<div class='summary'>";
    echo "<h2>Résumé</h2>";
    echo formatMessage("Total de propriétés insérées: {$inserted} / " . count($properties), $inserted === count($properties) ? 'success' : 'warning');
    
    if (!empty($errors)) {
        echo "<h3>Erreurs:</h3>";
        foreach ($errors as $error) {
            echo formatMessage($error, 'error');
        }
    }
    
    // Statistiques
    $stats = $pdo->query("
        SELECT 
            type, 
            COUNT(*) as count,
            AVG(price) as avg_price,
            MIN(price) as min_price,
            MAX(price) as max_price
        FROM properties 
        GROUP BY type
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Statistiques par type:</h3>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%;'>";
    echo "<tr><th>Type</th><th>Nombre</th><th>Prix moyen</th><th>Prix min</th><th>Prix max</th></tr>";
    foreach ($stats as $stat) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($stat['type']) . "</td>";
        echo "<td>" . $stat['count'] . "</td>";
        echo "<td>" . number_format($stat['avg_price'], 0, ',', ' ') . " €</td>";
        echo "<td>" . number_format($stat['min_price'], 0, ',', ' ') . " €</td>";
        echo "<td>" . number_format($stat['max_price'], 0, ',', ' ') . " €</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    $cityStats = $pdo->query("
        SELECT city, COUNT(*) as count 
        FROM properties 
        GROUP BY city
        ORDER BY count DESC
    ")->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Répartition par ville:</h3>";
    echo "<ul>";
    foreach ($cityStats as $city) {
        echo "<li>" . htmlspecialchars($city['city']) . ": " . $city['count'] . " propriété(s)</li>";
    }
    echo "</ul>";
    
    echo "</div>";
    
    echo formatMessage("Script terminé avec succès!", 'success');
    
} catch (Exception $e) {
    echo formatMessage("ERREUR: " . $e->getMessage(), 'error');
}

echo "</body></html>";
?>

