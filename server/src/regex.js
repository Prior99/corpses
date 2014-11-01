var Regexes = {
	//2708.932 Time: 45.01m FPS: 60.36 Heap: 234.5MB Max: 266.8MB Chunks: 0 CGO: 0 Ply: 0 Zom: 0 Ent: 0 (170) Items: 20
	info : new RegExp(
		'([+-]?\\d+\\.?\\d*)\\s' +
		'Time:\\s([+-]?\\d+\\.?\\d*)m\\s' +
		'FPS:\\s([+-]?\\d+\\.?\\d*)\\s' +
		'Heap:\\s([+-]?\\d+\\.?\\d*)[KMGTP]?B\\s' +
		'Max:\\s([+-]?\\d+\\.?\\d*)[KMGTP]?B\\s' +
		'Chunks:\\s(\\d+)\\s' +
		'CGO:\\s(\\d+)\\s' +
		'Ply:\\s(\\d+)\\s' +
		'Zom:\\s(\\d+)\\s' +
		'Ent:\\s(\\d+)\\s' +
		'\\((\\d+)\\)\\s' +
		'Items:\\s(\\d+)'),
	spawningWanderingHorde : new RegExp(
		'([+-]?\\d+\\.?\\d*)\\sSpawning\\sWandering\\sHorde\\.'),
	listKnownPlayers : new RegExp(
		'\\d+\\.\\s(.*?),\\s' + 
		'id=(\\d+),\\s' + 
		'steamid=(\\d+),\\s' + 
		'online=(False|True),\\s' + 
		'ip=(.*?),\\s' + 
		'playtime=(\\d+)\\sm,\\s' + 
		'seen=(.*?)\\r\\n'
	),
	getTime : new RegExp(
		'Day\\s(\\d+),\\s(\\d+):(\\d+)'),
	listPlayersExtended : new RegExp(
		'\\d+\\.\\s' + 
		'id=(\\d+),\\s' + 
		'(.*?),\\s' + 
		'pos=\\(([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*)\\),\\s' + 
		'rot=\\(([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*)\\),\\s' + 
		'remote=(False|True),\\s' + 
		'health=(\\d+),\\s' + 
		'deaths=(\\d+),\\s' + 
		'zombies=(\\d+),\\s' + 
		'players=(\\d+),\\s' + 
		'score=(\\d+),\\s' + 
		'steamid=(\\d+),\\s' +
		'ip=(.*?),\\s' + 
		'ping=(\\d+)'
		),
	playerConnected : new RegExp(
		'([+-]?\\d+\\.?\\d*)\\sPlayer\\sconnected,\\s' + 
		'clientid=(\\d+),\\s' + 
		'entityid=(\\d+),\\s' + 
		'name=(.*?),\\s' + 
		'steamid=(\\d+),\\s' + 
		'ip=(.*?)'),
	playerDisconnected : new RegExp(
		'([+-]?\\d+\\.?\\d*)\\sPlayer\\s(.*?)\\sdisconnected\\safter\\s([+-]?\\d+\\.?\\d*)\\sminutes')
};

/*console.log("2888.967 Time: 48.01m FPS: 60.36 Heap: 234.4MB Max: 266.8MB Chunks: 0 CGO: 0 Ply: 0 Zom: 0 Ent: 0 (170) Items: 20"
	.match(Regexes.info));
console.log("180894.800 Spawning Wandering Horde."
	.match(Regexes.spawning));
console.log("1. BRÖML, id=171, steamid=76561198025814985, online=False, ip=95.223.249.16, playtime=1606 m, seen=2014-11-01 12:34"
	.match(Regexes.listKnownPlayers));
console.log("Day 81, 18:52"
	.match(Regexes.getTime));
console.log("1. id=171, BRÖML, pos=(-422.6, 73.0, 714.2), rot=(-19.7, 4.2, 0.0), remote=True, health=42, deaths=46, zombies=585, players=0, score=397, steamid=76561198025814985, ip=95.223.249.16, ping=27"
	.match(Regexes.listPlayersExtended));
console.log("182437.300 Player connected, clientid=15, entityid=171, name=BRÖML, steamid=76561198025814985, ip=95.223.249.16"
	.match(Regexes.playerConnected));
console.log("182457.100 Player BRÖML disconnected after 0.3 minutes"
	.match(Regexes.playerDisconnected));*/
module.exports = Regexes;