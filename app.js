const readLine = require('readline');
const Messages = require('./messages');
const Operations = require('./operations');
const Directory = require('./directory');
const { createInflate } = require('zlib');

const dir = new Directory();

let interface = readLine.createInterface(process.stdin, process.stdout);

const tools = `Comandos :q = salir, :sa = guardar como, :s = guardar
 -------------------------------------------------------`;

const pantalla = `
                        =====================
                        Editor de texto.\n
                        =====================
                        Elige una opcion:\n
                        1 Crear nuevo documento
                        2 Abrir documento
                        3 Cerrar editor\n>
`;

mainScreen();

function mainScreen() {
    process.stdout.write('\033c');
    interface.question(pantalla, res => {
        switch (res.trim()) {
            case '1':
                createFile();
                break;
            case '2':
                openFile();
                break;
            case '3':
                interface.close();
                break;    
            default:
                mainScreen();
                break;
        }
    });
}

function createFile(){
    let file = new Operations(dir.getPath());

    renderInterface(file);
    readCommands(file);
}

function openFile() {
    let file = new Directory(dir.getPath());
    let file2 = new Operations(dir.getPath());
    dir.getFilesInDir();

    interface.question(Messages.requestFileName, name => {
        if(file2.exists(name)){
            oFile(file2,name);
        }else{
            console.log(Messages.fileNotFound);
            setTimeout(()=>{
                interface.removeAllListeners('line');
                mainScreen();
            },2000);
            
        }
    });
}

function oFile(file, name){
    file.open(name);
    renderInterface(file);
    readCommands(file);
}

function renderInterface(file,msj){
    process.stdout.write('\033c');
    (file.getName() == '') ? console.log(`| Untitled |`) : console.log(`| ${file.getName()} |`);

    console.log(tools);

    if (msj != null) {
        console.log(msj);
    }else{
        console.log(file.getContent());
    }
}

function readCommands(file){
    interface.on('line',(input)=>{
        switch (input.trim()) {
            case ':q':
                interface.removeAllListeners('line');
                mainScreen();
                break;
            case ':sa':
                saveas(file);
                break;
            case ':s':
                save(file);
                break;
            default:
                file.append(input.trim());
                break;
        }
    })
}

function saveas(file){
    interface.question(Messages.requestFileName, (name)=>{
        if (file.exists(name)) {
            console.log(Messages.fileExists);
            interface.question(Messages.replaceFile, confirm => {
                if (confirm = 'y') {
                    file.saveas(name);
                    renderInterface(file,Messages.fileSaved + '\n');
                } else {
                    renderInterface(file,Messages.fileNotSaved + '\n');
                }
            })
        }else{
            file.saveAs(name);
            renderInterface(file, Messages.fileSaved + '\n');
        }
    });
}

function save(file){
    if(file.hasName()){
        file.save();
        renderInterface(file, Messages.fileSaved + '\n');
    }else{
        saveas(file);
    }
}