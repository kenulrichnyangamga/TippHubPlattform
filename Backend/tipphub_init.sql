
-- Drop if exists (for dev resets)
DROP DATABASE IF EXISTS tipphub;
CREATE DATABASE tipphub;
USE tipphub;

-- Utilisateurs (THB, LCB, PUS, KWA)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('THB', 'LCB', 'PUS', 'KWA') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- THMCOINS tarif que le THB cree ou modifie
CREATE TABLE IF NOT EXISTS thm_coins_tarif (
  id INT PRIMARY KEY AUTO_INCREMENT,
   preis_euro DECIMAL(10, 2) NOT NULL,
  preis_coins INT NOT NULL,
  gueltig_ab DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Communities
CREATE TABLE communities (
    community_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(100),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- Appartenance des PUS à des communautés
CREATE TABLE community_members (
    user_id INT,
    community_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, community_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE
);

-- THMCoins (solde par utilisateur)
CREATE TABLE thmcoin_wallet (
    user_id INT PRIMARY KEY,
    balance DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Events créés dans une communauté
CREATE TABLE events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    community_id INT,
    created_by INT,
    scheduled_at DATETIME,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Wettanfragen par PUS
CREATE TABLE bets (
    bet_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    created_by INT,
    choice VARCHAR(50), -- z.B. Sieg, Unentschieden
    stake DECIMAL(10,2),
    odds DECIMAL(4,2),
    status ENUM('OPEN', 'ACCEPTED', 'CLOSED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Acceptation d'une bet par un autre PUS
CREATE TABLE bet_acceptances (
    acceptance_id INT AUTO_INCREMENT PRIMARY KEY,
    bet_id INT,
    accepted_by INT,
    accepted_odds DECIMAL(4,2),
    accepted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bet_id) REFERENCES bets(bet_id) ON DELETE CASCADE,
    FOREIGN KEY (accepted_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Ankündigungen KWA
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    external_link VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Visibilité des annonces dans des communautés
CREATE TABLE announcement_visibility (
    announcement_id INT,
    community_id INT,
    PRIMARY KEY (announcement_id, community_id),
    FOREIGN KEY (announcement_id) REFERENCES announcements(announcement_id) ON DELETE CASCADE,
    FOREIGN KEY (community_id) REFERENCES communities(community_id) ON DELETE CASCADE
);

-- Gutschriften de THMCoins
CREATE TABLE thmcoin_transfers (
    transfer_id INT AUTO_INCREMENT PRIMARY KEY,
    from_user INT,
    to_user INT,
    amount DECIMAL(10,2),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (to_user) REFERENCES users(user_id) ON DELETE SET NULL
);
