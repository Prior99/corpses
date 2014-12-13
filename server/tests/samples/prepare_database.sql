ALTER TABLE Users AUTO_INCREMENT=5;
ALTER TABLE Friends AUTO_INCREMENT=3;
ALTER TABLE Admins AUTO_INCREMENT=3;
ALTER TABLE Markers AUTO_INCREMENT=6;
ALTER TABLE MarkerIgnore AUTO_INCREMENT=1;


INSERT INTO Users(id, name, steamid, enabled, password) VALUES
(1, 'Test1', '345', 1, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(2, 'Test2', '234', 0, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'),
(4, 'Test3', '123', 1, 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');

INSERT INTO Friends(id, user, friend) VALUES
(7, 1, 2),
(8, 2, 1);

INSERT INTO Admins(id, user) VALUES
(1, 1);
