const fs = require('fs');
const path = require('path');

const ignoredFolders = ['.git', 'node_modules', '.travis', '.DS_Store'];

const searchDirectories = (filePath = './') => {
    fs.readdirSync(filePath).map(folder => {
        const folderPath = path.join(filePath, folder)
        if (fs.statSync(folderPath).isDirectory() && ignoredFolders.indexOf(folder) === -1) {
            folderWalk(folderPath);
        }
    })
};

const folderWalk = (folderPath) => {
    fs.readdirSync(folderPath).map(subfolder => {
        if (ignoredFolders.indexOf(subfolder) === -1) {
            const addFolderPath = path.join(folderPath, subfolder);
            addFileAndFolderPaths(addFolderPath);
        }
    })
};

const showPath = (stringPath, seperator) => {
    let array = stringPath.split('/');
    let start = 0;
    let end = array.length - 1;
    end++;
    return array.slice(start, end).join(seperator);
};

const addFileAndFolderPaths = (folderPath) => {
    if (fs.statSync(folderPath).isDirectory() && fs.existsSync(path.join(folderPath, 'info.yaml')) && !fs.existsSync(path.join(folderPath, 'README.md'))) {
        console.error(`README file does not exist in folder: ${showPath(folderPath, '/')}!`);
        process.exit(1);
    }
    else if (fs.statSync(folderPath).isDirectory() && !fs.existsSync(path.join(folderPath, 'info.yaml')) && fs.existsSync(path.join(folderPath, 'README.md'))) {
        console.error(`Yaml file does not exist in folder: ${showPath(folderPath, '/')}!`);
        process.exit(1);
    }
    else if (fs.statSync(folderPath).isDirectory()) {
        folderWalk(folderPath);
    }
};

const checkFiles = () => {
    searchDirectories();
    console.log('All files present!');
}

checkFiles();