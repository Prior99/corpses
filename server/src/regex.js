/*
 *  This file is part of CORPSES, a webinterface for 7 Days to Die.
 *
 *  CORPSES is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  CORPSES is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with CORPSES. If not, see <http://www.gnu.org/licenses/>.
 */

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
		'level=(\\d+),\\s' +
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
		'Player\\s(.*?)\\sdisconnected\\safter\\s([+-]?\\d+\\.?\\d*)\\sminutes'),
	playerSetOnline : new RegExp(
		'Player\\sset\\sto\\sonline:\\s(\\d+)'),
	playerSetOffline : new RegExp(
		'Player\\sset\\sto\\soffline:\\s(\\d+)')
};
module.exports = Regexes;
