from registration import Registration
from email.message import EmailMessage
import sqlite3
import smtplib
import sys


class ForgotPassword:

    def __init__(self):
        Registration.create_table(self)

    def forgot_password(self,email):
        connection = sqlite3.connect('../Stanley.db')
        cursor = connection.cursor()
        cursor.execute("""Select email,password from user where email = '{}'""".format(email))
        data = cursor.fetchone()
        if data is not None:
            email, password = data
            stanleyEmail = 'GMAIL_ACCOUNT'
            server = smtplib.SMTP('smtp.gmail.com',587)
            server.connect("smtp.gmail.com", 587)
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(stanleyEmail,'GMAIL_PASSWORD')
            mail = EmailMessage()
            mail.set_content('Dear user your password is : {}'.format(password))
            mail['To'] = email
            mail['From'] = stanleyEmail
            mail['Subject'] = 'Account Recovery'
            server.sendmail(stanleyEmail,email,mail.as_string())
            print('Email Sent')
        else:
            print('false')

if __name__ == '__main__':
    forgotPassword = ForgotPassword()
    text, email = sys.argv
    forgotPassword.forgot_password(email)
    sys.stdout.flush()