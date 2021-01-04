from registration import Registration
import sqlite3
import sys

class ChangePassword:

    def __init__(self):
        Registration.create_table(self)

    def change_password(self, username, opassword, npass):
        connection = sqlite3.connect('../Stanley.db')
        cursor = connection.cursor()
        cursor.execute("Select password from user where username ='{}'".format(username))
        oldPass = cursor.fetchone()[0]
        if oldPass == opassword:
            cursor.execute("Update user set password = '{}' where username ='{}'".format(npass,username))
            connection.commit()
            connection.close()
            print('Updated')
        else:
            print('Old password is not correct')

if __name__ == '__main__':
    changePass = ChangePassword()
    test, username, oldPass, newPass = sys.argv
    changePass.change_password(username, oldPass, newPass)
    sys.stdout.flush()