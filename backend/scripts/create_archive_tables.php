<?php
/**
 * Script pour créer les tables d'archivage
 * Exécuter ce script via le navigateur : http://localhost/RafikiMoukrim_SunshineProperties_PHP_API/backend/scripts/create_archive_tables.php
 */

header("Content-Type: text/html; charset=UTF-8");

// Inclure la configuration de la base de données
require_once "../config/db.php";

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Création des tables d'archivage</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #059669;
            margin-bottom: 20px;
        }
        .success {
            background: #d1fae5;
            border: 1px solid #10b981;
            color: #065f46;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .error {
            background: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        .info {
            background: #dbeafe;
            border: 1px solid #3b82f6;
            color: #1e40af;
            padding: 15px;
            border-radius: 6px;
            margin: 10px 0;
        }
        pre {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📦 Création des tables d'archivage</h1>
        
        <?php
        if (!isset($pdo)) {
            echo '<div class="error">❌ Erreur: Connexion à la base de données non disponible</div>';
            echo '<p>Vérifiez votre fichier <code>backend/config/db.php</code></p>';
            exit;
        }

        // Lire le fichier SQL
        $sqlFile = __DIR__ . '/create_archive_tables.sql';
        
        if (!file_exists($sqlFile)) {
            echo '<div class="error">❌ Erreur: Fichier SQL non trouvé: ' . $sqlFile . '</div>';
            exit;
        }

        $sql = file_get_contents($sqlFile);
        
        if (empty($sql)) {
            echo '<div class="error">❌ Erreur: Le fichier SQL est vide</div>';
            exit;
        }

        echo '<div class="info">📄 Fichier SQL trouvé: <code>' . basename($sqlFile) . '</code></div>';
        echo '<div class="info">📊 Exécution des requêtes SQL...</div>';

        // Diviser le SQL en requêtes individuelles
        $queries = array_filter(
            array_map('trim', explode(';', $sql)),
            function($query) {
                return !empty($query) && !preg_match('/^\s*--/', $query);
            }
        );

        $successCount = 0;
        $errorCount = 0;
        $errors = [];

        foreach ($queries as $index => $query) {
            if (empty(trim($query))) {
                continue;
            }

            try {
                $pdo->exec($query);
                $successCount++;
                
                // Détecter quelle table a été créée
                if (preg_match('/CREATE TABLE.*?`?(\w+)`?/i', $query, $matches)) {
                    $tableName = $matches[1];
                    echo '<div class="success">✅ Table créée: <strong>' . htmlspecialchars($tableName) . '</strong></div>';
                }
            } catch (PDOException $e) {
                $errorCount++;
                $errorMsg = $e->getMessage();
                
                // Ignorer l'erreur si la table existe déjà
                if (strpos($errorMsg, 'already exists') !== false || 
                    strpos($errorMsg, 'déjà existante') !== false ||
                    $e->getCode() == '42S01') {
                    echo '<div class="info">ℹ️ Table déjà existante (ignoré)</div>';
                    $errorCount--; // Ne pas compter comme erreur
                } else {
                    $errors[] = [
                        'query' => substr($query, 0, 100) . '...',
                        'error' => $errorMsg
                    ];
                    echo '<div class="error">❌ Erreur lors de l\'exécution: ' . htmlspecialchars($errorMsg) . '</div>';
                }
            }
        }

        // Résumé
        echo '<hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e7eb;">';
        
        if ($errorCount === 0) {
            echo '<div class="success">';
            echo '<h2>✅ Succès !</h2>';
            echo '<p><strong>' . $successCount . '</strong> requête(s) exécutée(s) avec succès.</p>';
            echo '<p>Les tables d\'archivage sont maintenant disponibles :</p>';
            echo '<ul>';
            echo '<li><strong>archived_clients</strong> - Pour les clients archivés</li>';
            echo '<li><strong>archived_properties</strong> - Pour les propriétés archivées</li>';
            echo '</ul>';
            echo '</div>';
        } else {
            echo '<div class="error">';
            echo '<h2>⚠️ Attention</h2>';
            echo '<p><strong>' . $successCount . '</strong> requête(s) réussie(s), <strong>' . $errorCount . '</strong> erreur(s).</p>';
            if (!empty($errors)) {
                echo '<h3>Détails des erreurs :</h3>';
                echo '<pre>';
                foreach ($errors as $error) {
                    echo htmlspecialchars($error['error']) . "\n";
                }
                echo '</pre>';
            }
            echo '</div>';
        }

        // Vérifier que les tables existent
        echo '<hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e7eb;">';
        echo '<h3>🔍 Vérification des tables créées :</h3>';
        
        $tablesToCheck = ['archived_clients', 'archived_properties'];
        
        foreach ($tablesToCheck as $table) {
            try {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    // Compter les lignes
                    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
                    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
                    echo '<div class="success">✅ Table <strong>' . $table . '</strong> existe (' . $count . ' enregistrement(s))</div>';
                } else {
                    echo '<div class="error">❌ Table <strong>' . $table . '</strong> n\'existe pas</div>';
                }
            } catch (PDOException $e) {
                echo '<div class="error">❌ Erreur lors de la vérification de <strong>' . $table . '</strong>: ' . htmlspecialchars($e->getMessage()) . '</div>';
            }
        }
        ?>
        
        <hr style="margin: 30px 0; border: none; border-top: 2px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 0.9rem;">
            <strong>Note :</strong> Vous pouvez maintenant utiliser la section "Archives" dans le dashboard admin pour gérer les éléments archivés.
        </p>
    </div>
</body>
</html>

