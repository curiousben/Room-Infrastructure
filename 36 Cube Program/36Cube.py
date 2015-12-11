import os
import sys
import random
import math

# clock wise
# left to right top to bottom
# on each 3x3 sections each number indicates what piece is needed to complete the tower
# for example 1 indicates that a 5 tower piece is needed to complete the tower.

# 1 and 2 o'clock
OneTwoBoard = [[1, 4, 6], [2, 5, 3], [4, 1, 2]]

# 4 and 5 o'clock
FourFiveBoard = [[3, 6, 4], [6, 3, 5], [5, 2, 1]]

# 7 and 8 o'clock
SevenEightBoard = [[1, 2, 5], [2, 4, 1], [3, 6, 4]]

# 10 and 11 o'clock
TenElevenBoard = [[5, 3, 2], [4, 1, 6], [6, 5, 3]]

#             Red  Blue Yellow Purple Green Orange Pieces

# random.randint(0,6)
# list.pop(index)
# Morphing List

# Tuple -> list

######

OnePieces = ['1R', '1B', '1Y', '1P', '1G', '1O']
TwoPieces = ['2R', '2B', '2Y', '2P', '2G', '2O']
ThreePieces = ['3R', '3B', '3Y', '3P', '3G', '3O']
FourPieces = ['4R', '4B', '4Y', '4P', '4G', '4O']
FivePieces = ['5R', '5B', '5Y', '5P', '5G', '5O']
SixPieces = ['6R', '6B', '6Y', '6P', '6G', '6O']
allPieces = [OnePieces,TwoPieces,ThreePieces,FourPieces,FivePieces,SixPieces]

def OneTwoRandBoardSectionGen(section,allPieces):
	# Potential board that will be returned #
	potentialUniqueBoard = [[],[],[]]

	# Iterates through all rows on the puzzle section #
	for row in xrange(len(section)):
		#Itereates through all columns on the puzzle section #
		for col in xrange(len(section[row])):
			# Individual tower size #
			neededIndividualTowerSize = section[row][col]
			# Gathering a piece's index number from a sorted group of pieces #
			randNumFromPossiblePieces = random.randint(0,(len(allPieces[neededIndividualTowerSize-1])-1))
			# Takes a  on the puzzle section  #
			choosenPiece = allPieces[neededIndividualTowerSize-1].pop(randNumFromPossiblePieces)
			potentialUniqueBoard[row].append(choosenPiece)
	return potentialUniqueBoard

print(OneTwoRandBoardSectionGen(OneTwoBoard,allPieces))

