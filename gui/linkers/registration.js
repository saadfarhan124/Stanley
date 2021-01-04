let { PythonShell } = require('python-shell')

function registration() {
    let path = require('path');
    let firstname = document.getElementById('firstname').value;
    let lastname = document.getElementById('lastname').value;
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let email = document.getElementById('email').value;
    let dob = document.getElementById('dob').value;
    if (firstname.length == 0 || lastname.length == 0 || username.length == 0 || password.length == 0 || email.length == 0 || dob.length == 0) {
        alert('Please fill in all the details');
        clearall();
    } else {
        let options = {
            mode: 'text',
            scriptPath: path.join(__dirname, '/../scripts/'),
            pythonPath: PYTHON_PATH,
            args: [firstname, lastname, username, password, email, dob]
        }
        let registration = new PythonShell('registration.py', options);
        registration.on('message', function (message) {
            alert(message);
            clearall();
        })
    }
}

function clearall() {
    document.getElementById('firstname').value = '';
    document.getElementById('lastname').value = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('confirm').value = '';
    document.getElementById('email').value = '';
    document.getElementById('dob').value = '';
    document.getElementById('passmessage').innerHTML = '';
    document.getElementById('emailmessage').innerHTML = '';
}

function passvalidate() {
    if (document.getElementById('password').value == '' &&
        document.getElementById('confirm').value == '') {
        document.getElementById('passmessage').innerHTML = '';
    }
    else if (document.getElementById('password').value ==
        document.getElementById('confirm').value) {
        document.getElementById('passmessage').style.color = 'green';
        document.getElementById('passmessage').innerHTML = 'Passwords Match';

    } else {
        document.getElementById('passmessage').style.color = 'red';
        document.getElementById('passmessage').innerHTML = 'Passwords do not match';
    }
    registerEnable();
}

function emailvalidate() {
    let validator = require('email-validator');
    document.getElementById('emailmessage').innerHTML = validator.validate(document.getElementById('email').value) ? 'Valid Email' : 'Invalid Email';
    document.getElementById('emailmessage').style.color = validator.validate(document.getElementById('email').value) ? 'green' : 'red';
    registerEnable();
}

function registerEnable() {
    document.getElementById("register").disabled = document.getElementById('passmessage').innerHTML == 'Passwords Match'
        && document.getElementById('emailmessage').innerHTML == 'Valid Email' ? false : true;
}

function firstnamecheck(){
    var textBox = document.getElementById('firstname');
    textBox.value = textBox.value.replace(/[^a-zA-Z]+/, '');
}
function lastnamecheck(){
    var textBox = document.getElementById('lastname');
    textBox.value = textBox.value.replace(/[^a-zA-Z]+/, '');
}