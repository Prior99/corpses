DROP TABLE IF EXISTS `Admins`;
DROP TABLE IF EXISTS `Friends`;
DROP TABLE IF EXISTS `MarkerIgnore`;
DROP TABLE IF EXISTS `Markers`;
DROP TABLE IF EXISTS `Users`;

CREATE TABLE IF NOT EXISTS Users (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name            VARCHAR(128) NOT NULL UNIQUE,
	steamid         VARCHAR(128) NOT NULL UNIQUE,
	enabled         BOOL,
	password        VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS Friends (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user            INT NOT NULL,
	friend          INT NOT NULL,
	FOREIGN KEY(user)   REFERENCES Users(id) ON DELETE CASCADE,
	FOREIGN KEY(friend) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Admins (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user            INT NOT NULL UNIQUE,
	FOREIGN KEY(user) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Markers (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	name            VARCHAR(128) NOT NULL,
	description     TEXT,
	lat             FLOAT NOT NULL,
	lng             FLOAT NOT NULL,
	visibility      ENUM('private', 'friends', 'public') NOT NULL DEFAULT 'public',
	author          INT NOT NULL,
	icon            VARCHAR(32) NOT NULL,
	FOREIGN KEY(author) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS MarkerIgnore (
	id              INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	user            INT NOT NULL,
	marker          INT NOT NULL,
	FOREIGN KEY(user)   REFERENCES Users(id) ON DELETE CASCADE,
	FOREIGN KEY(marker) REFERENCES Markers(id) ON DELETE CASCADE
);
