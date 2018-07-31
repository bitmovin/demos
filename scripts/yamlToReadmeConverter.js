const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

const folderPaths = [];
const filePaths = [];
const ignoredFolders = ['.git', 'node_modules', '.travis', '.DS_Store', 'scripts', 'css', 'js'];

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

const addFileAndFolderPaths = (folderPath) => {
    if (fs.statSync(folderPath).isDirectory() && fs.existsSync(path.join(folderPath, 'info.yaml'))) {
        const addFilePath = path.join(folderPath, 'info.yaml');
        folderPaths.push(folderPath);
        filePaths.push(addFilePath);
    }
    else if (fs.statSync(folderPath).isDirectory()) {
        folderWalk(folderPath);
    }
    else {
        console.error(`Yaml file does not exist in folder: ${folderPath}!`);
        process.exit(1);
    }
};

const parseTags = (tags) => {
    let parsedTags = '';
    tags.forEach((tag) => {
            parsedTags += `\r\n  - ${tag}`; 
    });
    return parsedTags;
};

const createReadme = (filePath, index) => {
    YAML.load(filePath, (result) => {
        const mapObj = {
            '{{title}}': result.title,
            '{{description}}': result.description,
            '{{long_description}}': result.long_description
        }

        fs.readFile('./readmeTemplate.txt', 'utf8', (error, data) => {
            if (error) {
                console.error(error);
                process.exit(1);
            };
            const readmePath = folderPaths[index] + '/README.md';

            const readmeResult = data.replace(/{{title}}|{{description}}|{{long_description}}/gi, (matched) => {
                return mapObj[matched];
            }) + parseTags(result.tags);

            fs.writeFile(readmePath, readmeResult, (error) => {
                if (error) {
                    console.error(error);
                    process.exit(1);
                };
            })
        })
    })
};

const checkAndCreateReadmes = () => {
    searchDirectories();

    filePaths.forEach((filePath, index) => createReadme(filePath, index));
    console.log('All readmes generated!');
};

checkAndCreateReadmes();
