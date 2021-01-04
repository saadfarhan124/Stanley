const url = require('url');
const path = require('path')
const { app, BrowserWindow, Menu, ipcMain, MenuItem } = require('electron');
const storage = require('electron-localstorage');
var mainWindow;
var moviepath;
app.on('ready', function () {
    //main window config , resizable: false
    mainWindow = new BrowserWindow({ width: 1200, height: 700, center: true, show: false, resizable: false, title: "Stanley" });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'login.html'),
        protocol: 'file:',
        slashes: true
    }));
    //building and setting menu
    let mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);
    //smooth transition function
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    })
    mainWindow.on('closed', function () { app.quit(); })
    //ipc communication between js and renderer
    ipcMain.on('synchronous-message', (event, arg) => {
        if (arg == 'play') {
            mainWindow.setFullScreen(true);
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'videoplayer.html'),
                protocol: 'file:',
                slashes: true
            }));
        } else {
            storage.setItem('username', arg);
            //enabling change password option for logged in users
            mainMenu.getMenuItemById('logout').visible = true;
            mainMenu.getMenuItemById('mw').visible = true;
            Menu.setApplicationMenu(mainMenu);
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'mainWindow.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    })
});
const mainMenuTemplate = [

    {
        label: 'File',
        id: 'file',
        submenu: [
            {
                label: 'Main Window',
                id: 'mw',
                visible: false,
                click() {
                    mainWindow.setFullScreen(false);
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'mainWindow.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                }
            },
            {
                label: 'Logout',
                id: 'logout',
                visible: false,
                click() {
                    //logout functuin
                    storage.clear();
                    mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
                    Menu.setApplicationMenu(mainMenu);
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'login.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                }
            },
            { type: 'separator' },
            { role: 'reload' },
            { role: 'forceReload' },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];
//ioS doesn't allow menus to be inserted without submenu
//including dev tools in menu
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate[0].submenu.push({
        label: 'Toggle Developer Tools',
        accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+T',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    }
    );
}