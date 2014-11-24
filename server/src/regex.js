var Regexes = {
	info : new RegExp(
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
		'Spawning\\sWandering\\sHorde\\.'),
	listKnownPlayers : new RegExp(
		'\\d+\\.\\s(.*?),\\s' +
		'id=(\\d+),\\s' +
		'steamid=(\\d+),\\s' +
		'online=(False|True),\\s' +
		'ip=(.*?),\\s' +
		'playtime=(\\d+)\\sm,\\s' +
		'seen=(.*)', 'g'
	),
	getTime : new RegExp(
		'Day\\s(\\d+),\\s(\\d+):(\\d+)'),
	listPlayersExtended : new RegExp(
		'\\d+\\.\\s' +
		'id=(\\d*),\\s' +
		'(.*?),\\s' +
		'pos=\\(([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*)\\),\\s' +
		'rot=\\(([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*),\\s?([+-]?\\d+\\.?\\d*)\\),\\s' +
		'remote=(False|True|),\\s' +
		'health=(\\d+),\\s' +
		'deaths=(\\d+),\\s' +
		'zombies=(\\d+),\\s' +
		'players=(\\d+),\\s' +
		'score=(\\d+),\\s' +
		'steamid=(\\d+),\\s' +
		'ip=(.*?),\\s' +
		'ping=(\\d+)', 'g'
		),
	playerConnected : new RegExp(
		'Player\\sconnected,\\s' +
		'clientid=(\\d+),\\s' +
		'entityid=(\\d+),\\s' +
		'name=(.*?),\\s' +
		'steamid=(\\d+),\\s' +
		'ip=(.*)'),
	playerDisconnected : new RegExp(
		'Player\\s(.*?)\\sdisconnected\\safter\\s([+-]?\\d+\\.?\\d*)\\sminutes')
};
module.exports = Regexes;
