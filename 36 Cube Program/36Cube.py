import os
import sys
import random
import math
import copy

# Red  Blue Yellow Purple Green Orange Pieces

# random.randint(0,6)
# list.pop(index)
# Morphing List

# Tuple -> list

######

def randboardsectiongen(section, allpieces):

    # <================ Board Creation ================>

    # Potential solution array that will be returned #
    potentialuniqueboard = [[], [], []]

    # Iterates through all rows on the puzzle section
    for row in xrange(len(section)):
        # Iterates through all columns on the puzzle section
        for col in xrange(len(section[row])):
            # Individual tower size that is needed from the specific part of the puzzle (1 and 2 o'clock,# 4
            #  and 5 o'clock,etc.)
            neededindividualtowersize = section[row][col]
            # Determine the index of a possible puzzle piece from the remaining puzzle pieces array (the dynamic
            #  and larger one)
            randselectfrompossiblepieces = random.randint(0, (len(allpieces[neededindividualtowersize - 1]) - 1))
            # Pulls the piece out of the array at the index randselectfrompossiblepieces
            choosenpiece = allpieces[neededindividualtowersize - 1].pop(randselectfrompossiblepieces)
            # Attach this piece on the potential solution array
            potentialuniqueboard[row].append(choosenpiece)
    # Passes the potential solution array and the remaining unused pieces out of the function
    return [potentialuniqueboard, allpieces]


def boardchecker(width,height,potentialboard):
    # <================ Row Checking ================>

    # Goes through each row of the potentialboard
    for row in xrange(len(potentialboard)):
        # This (rowIndColors) the primary color that the secondary color in the row is compared against.
        for rowIndColors in xrange(len(potentialboard[row])):
            # This (comparedRowIndColors) is the secondary color in the row.
            for comparedRowIndColors in xrange(rowIndColors, len(potentialboard[row])):
                # This insures that the secondary color is not the primary color.
                if rowIndColors != comparedRowIndColors:
                    # When the primary and the secondary colors are the same color then this potential board is no good
                    if potentialboard[row][rowIndColors][1] == potentialboard[row][comparedRowIndColors][1]:
                        # The passed in potential solution array has a non unique row of colors passes a False statement
                        return False

    # <================ Board Flipping ================>

    flippedPotentialBoard = [[], [], []]

    for col in xrange(width):
        for row in xrange(height):
            element = potentialboard[row][col]
            flippedPotentialBoard[col].append(element)

    # <================ Column Checking ================>

    # Goes through each row which was a column of the potentialboard
    # Same method as before
    for row in xrange(len(flippedPotentialBoard)):
        for rowIndColors in xrange(len(flippedPotentialBoard[row])):
            for comparedRowIndColors in xrange(rowIndColors, len(flippedPotentialBoard[row])):
                if rowIndColors != comparedRowIndColors:
                    if flippedPotentialBoard[row][rowIndColors][1] == flippedPotentialBoard[row][comparedRowIndColors][1]:
                        return False

    # The passed in potential solution array has unique colors for rows and columns so a true statement is passed on
    return True

def TenElevenSolution():
    # clock wise
    # left to right top to bottom
    # on each 3x3 sections each number indicates what piece is needed to complete the tower
    # for example 1 indicates that a 5 tower piece is needed to complete the tower.

    # 1 and 2 o'clock
    #onetwoboard = [[1, 4, 6], [2, 5, 3], [4, 1, 2]]

    # 4 and 5 o'clock
    # fourfiveboard = [[3, 6, 4], [6, 3, 5], [5, 2, 1]]


    # 10 and 11 o'clock
    tenelevenboard = [[5, 3, 2], [4, 1, 6], [6, 5, 3]]

    onepieces = ['1R', '1B', '1Y', '1P', '1G', '1O']
    twopieces = ['2R', '2B', '2Y', '2P', '2G', '2O']
    threepieces = ['3R', '3B', '3Y', '3P', '3G', '3O']
    fourpieces = ['4R', '4B', '4Y', '4P', '4G', '4O']
    fivepieces = ['5R', '5B', '5Y', '5P', '5G', '5O']
    sixpieces = ['6R', '6B', '6Y', '6P', '6G', '6O']
    allpieces = [onepieces, twopieces, threepieces, fourpieces, fivepieces, sixpieces]

    tenelevensolution = randboardsectiongen(tenelevenboard, allpieces)
    isthissolutionunique = boardchecker(3,3,tenelevensolution[0])
    remainingPieces = tenelevensolution[1]
    return [isthissolutionunique, tenelevensolution[0], remainingPieces]

def SevenEightSolution(remainingPieces):

    # 7 and 8 o'clock
    seveneightboard = [[1, 2, 5], [2, 4, 1], [3, 6, 4]]

    sevenEightSolution = randboardsectiongen(seveneightboard, remainingPieces)
    isThisSolutionUnique = boardchecker(3,3,sevenEightSolution[0])
    remainingPieces = sevenEightSolution[1]
    return [isThisSolutionUnique, sevenEightSolution[0], remainingPieces]

def PuzzleArray(currentSolution,addedArray,stage):

    if stage == 2:
        for row in addedArray:
            currentSolution.append(row)
        return currentSolution

def PuzzleSolver():
    puzzleDone = False
    while not puzzleDone:
    # <================ Finds a unique solution to the first section (10 and 11 o'clock)================>
        firstSectSol = TenElevenSolution()
        while not firstSectSol[0]:
            firstSectSol = TenElevenSolution()
        stageTwoCount = 0
        while stageTwoCount <= 100000000:
    # <================ Finds a unique solution to the second section (7 and 8 o'clock)================>
            remainingPiecesForSecTwo = [x[:] for x in firstSectSol[2]]
            secondSectSol = SevenEightSolution(remainingPiecesForSecTwo)
            stageTwoCount += 1
            while not secondSectSol[0]:
                remainingPiecesForSecTwo = [z[:] for z in firstSectSol[2]]
                secondSectSol = SevenEightSolution(remainingPiecesForSecTwo)
                stageTwoCount += 1
    # <================ Combining the first two Arrays 10/11 & 7/8 O'Clock ================>
            copyOfFirstSectSol = [y[:] for y in firstSectSol[1]]
            combinedArray = PuzzleArray(copyOfFirstSectSol,secondSectSol[1],2)
    # <================ Ensures the new Array is unique ================>
            uniqueCrossSection = boardchecker(3,6,combinedArray)
            if uniqueCrossSection:
                return [combinedArray,stageTwoCount]


def MainDriver():
    solution = PuzzleSolver()
    print (solution[1])
# <================ Pretty Print ================>
    for answerRow in solution[0]:
        print(answerRow)

MainDriver()