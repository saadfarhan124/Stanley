import sqlite3
import sys
from registration import Registration


class Login:
    def __init__(self):
        Registration.create_table(self)

    def authentication(self, username, password):
        connection = sqlite3.connect('../Stanley.db')
        cursor = connection.cursor()
        cursor.execute('Select * from user where username = "{}" and password = "{}"'.format(username,password))
        if cursor.fetchone() is None:
            return False
        return True



if __name__ == '__main__':
    login = Login()
    username = sys.argv[1]
    password = sys.argv[2]
    print(login.authentication(username,password))
    sys.stdout.flush()
    
