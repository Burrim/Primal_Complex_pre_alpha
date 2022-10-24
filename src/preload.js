window.fs = require('fs');
const { ipcRenderer} = require('electron')
window.addEventListener('keydown', (e) => {
    switch(e.key){
        case "Escape":
            console.log('shutdown')
            ipcRenderer.send('Shutdown', true)
        break;
        case "F11":
            ipcRenderer.send('Fullscreen', true)
        break;
    }
  
    
  });
