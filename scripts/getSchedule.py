import xml.etree.ElementTree as elemTree
import urllib2 as url2

class newGame:
	pass

def fetchSchedule():
	
	data = url2.urlopen('http://api.sportsdatallc.org/nfl-t1/2013/REG/schedule.xml?api_key=v38np4ejnbegrdztr68bfsp6')

	tree = elemTree.parse(data)

	root = tree.getroot()
	season = root.get('season')
	gameType = root.get('type')


	games = []

	for child in root:
		newRoot = child
		week = newRoot.get('week')
		for elem in newRoot:
			game = newGame()
			game.id = elem.get('id')
			game.scheduled = elem.get('scheduled')
			game.hometeam_id = elem.get('home')
			game.awayteam_id = elem.get('away')
			game.status = elem.get('status')
			game.season = season
			game.type = gameType
			game.week = week
			games.append(game)


	for itr in range(0,len(games)):
		try:
			if games[itr].id == None:
				del games[itr]
			"""print games[itr].id,  games[itr].scheduled,  games[itr].hometeam_id,  games[itr].awayteam_id,  games[itr].status,  games[itr].season,  games[itr].type,  games[itr].week"""
		except IndexError:
			pass

def uploadSchedule():





