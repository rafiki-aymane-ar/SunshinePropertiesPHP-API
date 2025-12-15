<?php
/**
 * Helper function to convert user identifier (numeric ID, Firebase UID, or email) to database ID
 * @param string $user_type - 'client' or 'agent'
 * @param string|int $user_input - Can be numeric ID, Firebase UID, or email
 * @return int|null - Database ID or null if not found
 */
function getUserIdFromInput($user_type, $user_input) {
    global $pdo;
    
    // Si c'est déjà un nombre valide, le retourner
    if (is_numeric($user_input) && (int)$user_input > 0) {
        return (int)$user_input;
    }
    
    // Sinon, c'est probablement un UID Firebase ou un email, chercher dans la base
    if ($user_type == 'client') {
        $stmt = $pdo->prepare("SELECT id FROM clients WHERE email = ? OR uid = ? LIMIT 1");
    } else {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? OR uid = ? LIMIT 1");
    }
    $stmt->execute([$user_input, $user_input]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result ? (int)$result['id'] : null;
}
?>

