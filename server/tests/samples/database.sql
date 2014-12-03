-- phpMyAdmin SQL Dump
-- version 3.4.11.1deb2+deb7u1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Erstellungszeit: 03. Dez 2014 um 16:07
-- Server Version: 5.5.38
-- PHP-Version: 5.4.4-14+deb7u14

DROP TABLE IF EXISTS `Admins`;
DROP TABLE IF EXISTS `Friends`;
DROP TABLE IF EXISTS `MarkerIgnore`;
DROP TABLE IF EXISTS `Markers`;
DROP TABLE IF EXISTS `Users`;

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Datenbank: `corpsestest`
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Admins`
--

CREATE TABLE IF NOT EXISTS `Admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Daten für Tabelle `Admins`
--

INSERT INTO `Admins` (`id`, `user`) VALUES
(1, 1),
(2, 2);

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Friends`
--

CREATE TABLE IF NOT EXISTS `Friends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  `friend` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `friend` (`friend`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `MarkerIgnore`
--

CREATE TABLE IF NOT EXISTS `MarkerIgnore` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` int(11) NOT NULL,
  `marker` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user` (`user`),
  KEY `marker` (`marker`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Markers`
--

CREATE TABLE IF NOT EXISTS `Markers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `description` text,
  `lat` float NOT NULL,
  `lng` float NOT NULL,
  `visibility` enum('private','friends','public') NOT NULL DEFAULT 'public',
  `author` int(11) NOT NULL,
  `icon` varchar(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `author` (`author`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Daten für Tabelle `Markers`
--

INSERT INTO `Markers` (`id`, `name`, `description`, `lat`, `lng`, `visibility`, `author`, `icon`) VALUES
(1, 'Andras Base', '', -550, 663, 'private', 1, 'heart'),
(2, 'Andras Base', '', -551, 663, 'private', 1, 'heart'),
(4, 'Andras Base', '', -547, 666, 'public', 1, 'binoculars'),
(5, 'Priors Base', '', -858, 1335, 'friends', 1, 'heart');

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Users`
--

CREATE TABLE IF NOT EXISTS `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `steamid` varchar(128) NOT NULL,
  `enabled` tinyint(1) DEFAULT NULL,
  `password` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `steamid` (`steamid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Daten für Tabelle `Users`
--

INSERT INTO `Users` (`id`, `name`, `steamid`, `enabled`, `password`) VALUES
(1, 'Test1', '345', 1, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(2, 'Test2', '234', 0, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(4, 'Test3', '123', 1, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

--
-- Constraints der exportierten Tabellen
--

--
-- Constraints der Tabelle `Admins`
--
ALTER TABLE `Admins`
  ADD CONSTRAINT `Admins_ibfk_2` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Admins_ibfk_1` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `Friends`
--
ALTER TABLE `Friends`
  ADD CONSTRAINT `Friends_ibfk_3` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Friends_ibfk_4` FOREIGN KEY (`friend`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Friends_ibfk_1` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Friends_ibfk_2` FOREIGN KEY (`friend`) REFERENCES `Users` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `MarkerIgnore`
--
ALTER TABLE `MarkerIgnore`
  ADD CONSTRAINT `MarkerIgnore_ibfk_3` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `MarkerIgnore_ibfk_4` FOREIGN KEY (`marker`) REFERENCES `Markers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `MarkerIgnore_ibfk_1` FOREIGN KEY (`user`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `MarkerIgnore_ibfk_2` FOREIGN KEY (`marker`) REFERENCES `Markers` (`id`) ON DELETE CASCADE;

--
-- Constraints der Tabelle `Markers`
--
ALTER TABLE `Markers`
  ADD CONSTRAINT `Markers_ibfk_2` FOREIGN KEY (`author`) REFERENCES `Users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `Markers_ibfk_1` FOREIGN KEY (`author`) REFERENCES `Users` (`id`) ON DELETE CASCADE;
