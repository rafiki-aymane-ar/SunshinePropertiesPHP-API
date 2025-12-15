-- ========================================================================
-- Script SQL pour insérer des propriétés de test
-- ========================================================================
-- Ce script ajoute 30 propriétés variées pour tester le chatbot
-- Types: appartements, maisons, villas, terrains, bureaux
-- Budgets: de 80 000€ à 800 000€
-- Villes: Paris, Lyon, Marseille, Bordeaux, Nice, Toulouse
-- ========================================================================

-- Note: Assurez-vous d'avoir au moins un utilisateur admin avec id=1
-- Si nécessaire, ajustez created_by selon votre base de données

-- ========================================================================
-- APPARTEMENTS
-- ========================================================================

-- Appartements à Paris
INSERT INTO properties (title, description, price, type, surface, rooms, address, city, status, created_by, created_at) VALUES
('Studio cosy dans le Marais', 'Studio rénové de 25m² dans le quartier historique du Marais. Parfait pour étudiant ou jeune actif. Proche transports.', 180000, 'appartement', 25, 1, '15 Rue des Rosiers', 'Paris', 'disponible', 1, NOW()),
('Appartement 2 pièces Montmartre', 'Charmant appartement de 45m² avec balcon. Vue sur les toits de Paris. Proche métro et commerces.', 320000, 'appartement', 45, 2, '22 Rue Lepic', 'Paris', 'disponible', 1, NOW()),
('Appartement 3 pièces République', 'Appartement lumineux de 65m² avec balcon. Séjour spacieux, cuisine équipée. Proche République.', 450000, 'appartement', 65, 3, '8 Boulevard Voltaire', 'Paris', 'disponible', 1, NOW()),
('Appartement 4 pièces Trocadéro', 'Grand appartement de 95m² avec vue sur la Tour Eiffel. Parquet, hauts plafonds. Standing.', 750000, 'appartement', 95, 4, '12 Avenue Kléber', 'Paris', 'disponible', 1, NOW()),

-- Appartements à Lyon
('Studio moderne Confluence', 'Studio neuf de 28m² dans le quartier Confluence. Vue sur la Saône. Parking disponible.', 165000, 'appartement', 28, 1, '45 Quai Rambaud', 'Lyon', 'disponible', 1, NOW()),
('Appartement 2 pièces Presqu''île', 'Appartement de 50m² dans le cœur de Lyon. Proche commerces et transports. Rénové en 2023.', 280000, 'appartement', 50, 2, '18 Rue de la République', 'Lyon', 'disponible', 1, NOW()),
('Appartement 3 pièces Part-Dieu', 'Appartement de 70m² proche de la Part-Dieu. Balcon, parking. Idéal famille.', 380000, 'appartement', 70, 3, '25 Boulevard Vivier Merle', 'Lyon', 'disponible', 1, NOW()),

-- Appartements à Marseille
('Studio Vieux-Port', 'Studio de 22m² avec vue sur le Vieux-Port. Proche plages et commerces. Idéal investissement.', 120000, 'appartement', 22, 1, '10 Quai du Port', 'Marseille', 'disponible', 1, NOW()),
('Appartement 2 pièces Canebière', 'Appartement de 48m² rénové. Proche Canebière et métro. Lumineux et calme.', 195000, 'appartement', 48, 2, '35 La Canebière', 'Marseille', 'disponible', 1, NOW()),
('Appartement 3 pièces Prado', 'Appartement de 75m² proche plages du Prado. Terrasse, parking. Vue mer.', 420000, 'appartement', 75, 3, '88 Avenue du Prado', 'Marseille', 'disponible', 1, NOW()),

-- ========================================================================
-- MAISONS
-- ========================================================================

-- Maisons à Bordeaux
('Maison 4 pièces Chartrons', 'Maison de 110m² avec jardin. Quartier Chartrons. Rénovée, garage. Proche centre-ville.', 420000, 'maison', 110, 4, '12 Rue Notre-Dame', 'Bordeaux', 'disponible', 1, NOW()),
('Maison 5 pièces Caudéran', 'Maison de 140m² avec piscine. Quartier résidentiel. Jardin 500m². Idéal famille.', 580000, 'maison', 140, 5, '45 Avenue de la Libération', 'Bordeaux', 'disponible', 1, NOW()),

-- Maisons à Toulouse
('Maison 3 pièces Capitole', 'Maison de 85m² avec terrasse. Proche Capitole. Rénovée, charme ancien.', 285000, 'maison', 85, 3, '18 Rue des Filatiers', 'Toulouse', 'disponible', 1, NOW()),
('Maison 4 pièces Purpan', 'Maison de 120m² avec jardin. Quartier Purpan. Garage, double vitrage.', 380000, 'maison', 120, 4, '32 Rue de Purpan', 'Toulouse', 'disponible', 1, NOW()),

-- Maisons à Nice
('Maison 3 pièces Cimiez', 'Maison de 90m² avec vue mer. Quartier Cimiez. Terrasse, parking.', 450000, 'maison', 90, 3, '25 Avenue de Cimiez', 'Nice', 'disponible', 1, NOW()),
('Maison 5 pièces Mont Boron', 'Maison de 160m² avec piscine et vue panoramique. Jardin 600m². Standing.', 720000, 'maison', 160, 5, '88 Chemin de Mont Boron', 'Nice', 'disponible', 1, NOW()),

-- ========================================================================
-- VILLAS
-- ========================================================================

-- Villas à Nice
('Villa moderne avec piscine', 'Villa de 200m² avec piscine et jardin 800m². 5 chambres, vue mer. Proche plages.', 850000, 'villa', 200, 5, '120 Promenade des Anglais', 'Nice', 'disponible', 1, NOW()),
('Villa luxe Cap d''Antibes', 'Villa de 280m² avec piscine chauffée. 6 chambres, jardin 1000m². Vue exceptionnelle.', 1200000, 'villa', 280, 6, '45 Boulevard du Cap', 'Nice', 'disponible', 1, NOW()),

-- Villas à Bordeaux
('Villa contemporaine', 'Villa de 180m² avec piscine. 4 chambres, jardin 600m². Proche centre-ville.', 650000, 'villa', 180, 4, '78 Avenue de la Marne', 'Bordeaux', 'disponible', 1, NOW()),

-- ========================================================================
-- TERRAINS
-- ========================================================================

-- Terrains constructibles
('Terrain constructible 500m²', 'Terrain constructible de 500m². Viabilisé, permis de construire possible. Proche centre.', 95000, 'terrain', 500, NULL, 'Chemin des Vignes', 'Lyon', 'disponible', 1, NOW()),
('Terrain constructible 800m²', 'Terrain de 800m² avec vue. Viabilisé, eau, électricité. Idéal construction villa.', 145000, 'terrain', 800, NULL, 'Route de la Plaine', 'Marseille', 'disponible', 1, NOW()),
('Terrain constructible 1000m²', 'Grand terrain de 1000m². Viabilisé, pente douce. Vue panoramique.', 180000, 'terrain', 1000, NULL, 'Avenue des Collines', 'Toulouse', 'disponible', 1, NOW()),

-- ========================================================================
-- BUREAUX / COMMERCIAUX
-- ========================================================================

-- Bureaux à Paris
('Bureau 50m² La Défense', 'Bureau de 50m² dans immeuble moderne. Climatisation, ascenseur. Proche transports.', 320000, 'bureau', 50, NULL, '15 Place de la Défense', 'Paris', 'disponible', 1, NOW()),
('Bureau 80m² Opéra', 'Bureau de 80m² proche Opéra. Rénové, lumineux. Idéal cabinet professionnel.', 480000, 'bureau', 80, NULL, '22 Boulevard des Capucines', 'Paris', 'disponible', 1, NOW()),

-- Bureaux à Lyon
('Bureau 60m² Part-Dieu', 'Bureau de 60m² dans tour Part-Dieu. Vue panoramique. Parking disponible.', 280000, 'bureau', 60, NULL, '30 Boulevard Vivier Merle', 'Lyon', 'disponible', 1, NOW()),
('Local commercial 40m²', 'Local commercial de 40m² en rez-de-chaussée. Vitrine, stockage. Proche commerces.', 195000, 'bureau', 40, NULL, '55 Rue de la République', 'Lyon', 'disponible', 1, NOW()),

-- Bureaux à Marseille
('Bureau 70m² Vieux-Port', 'Bureau de 70m² avec vue port. Rénové, climatisé. Proche centre-ville.', 350000, 'bureau', 70, NULL, '18 Quai des Belges', 'Marseille', 'disponible', 1, NOW()),

-- ========================================================================
-- PROPRIÉTÉS VARIÉES (pour diversité)
-- ========================================================================

-- Appartements supplémentaires
('Appartement 2 pièces Bordeaux', 'Appartement de 55m² avec balcon. Quartier Saint-Michel. Rénové, lumineux.', 245000, 'appartement', 55, 2, '28 Rue Saint-Michel', 'Bordeaux', 'disponible', 1, NOW()),
('Appartement 3 pièces Toulouse', 'Appartement de 68m² avec terrasse. Proche Capitole. Parquet, hauts plafonds.', 295000, 'appartement', 68, 3, '42 Rue Alsace-Lorraine', 'Toulouse', 'disponible', 1, NOW()),
('Appartement 1 pièce Nice', 'Studio de 30m² avec balcon. Proche plages. Rénové, mezzanine possible.', 185000, 'appartement', 30, 1, '15 Rue de France', 'Nice', 'disponible', 1, NOW());

-- ========================================================================
-- VÉRIFICATION
-- ========================================================================
-- Pour vérifier les propriétés insérées, exécutez :
-- SELECT COUNT(*) as total FROM properties;
-- SELECT type, COUNT(*) as count FROM properties GROUP BY type;
-- SELECT city, COUNT(*) as count FROM properties GROUP BY city;
-- ========================================================================

