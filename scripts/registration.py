import sqlite3
import sys


class Registration:

    def __init__(self):
        self.create_table()

    def create_table(self):
        connection = sqlite3.connect('../Stanley.db')
        cursor = connection.cursor()
        cursor.execute("""
        Create table if not exists user(
        userid INTEGER PRIMARY KEY AUTOINCREMENT,
        firstname TEXT,
        lastname TEXT,
        username TEXT UNIQUE,
        password TEXT,
        email TEXT,
        dateofbirth TEXT
        )
        """)
        cursor.execute("""
        Create table if not exists favorite_movies(
        userid INTEGER NOT NULL ,
        movie_title TEXT UNIQUE NOT NULL,
        score INTEGER NOT NULL,
        FOREIGN KEY (userid) REFERENCES user (userid)
        );
        """)

    def register_user(self, firstname, lastname, username, password, email, dob):
        try:
            connection = sqlite3.connect('..\Stanley.db')
            cursor = connection.cursor()
            cursor.execute("""Insert into user (
            firstname, lastname, username, password, email, dateofbirth) values(
            '{}','{}','{}','{}','{}','{}'
            )""".format(firstname,lastname,username,password,email,dob))
            connection.commit()
            print('Successfully registered')
        except sqlite3.IntegrityError:
            print('Username already taken')


if __name__ == '__main__':
    registration = Registration()
    test, firstname, lastname, username, password, email, dob = sys.argv
    registration.register_user(firstname, lastname, username, password, email, dob)
    sys.stdout.flush()
