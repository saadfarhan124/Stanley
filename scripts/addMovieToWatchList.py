from registration import Registration
import sqlite3
import sys

class AddMovieToWatchList:

    def __init__(self):
        Registration.create_table(self)

    def addMovieToWatchList(self, username, movietitle, score):
        try:
            connection = sqlite3.connect('../Stanley.db')
            cursor = connection.cursor()
            userid = cursor.execute('Select userid from user where username = "{}"'.format(username)).fetchone()[0]
            cursor.execute('Insert into favorite_movies values ({},"{}",{})'.format(
                userid, movietitle, score
            ))
            connection.commit()
            print('Movie Added To The List')
        except sqlite3.IntegrityError:
            print('false')


if __name__ == '__main__':
    test, userName, movieTitle, score = sys.argv
    addMovieToWatchList = AddMovieToWatchList()
    addMovieToWatchList.addMovieToWatchList(userName, movieTitle, score)
    sys.stdout.flush()