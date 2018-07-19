const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

let folderPaths = [];
let filePaths = [];

const getDirectories = (filePath = './') => {
    fs.readdirSync(filePath).map(folder => {
        const folderPath = path.join(filePath, folder)
        if (fs.statSync(folderPath).isDirectory() && folder !== '.git' && folder !== 'node_modules') {
            folderWalk(folderPath);
        }
    })
}

const folderWalk = (folderPath) => {
    fs.readdirSync(folderPath).map(subfolder => {
        if (subfolder !== '.DS_Store') {
            const addFolderPath = path.join(folderPath, subfolder);
            addFileAndFolderPaths(addFolderPath);
        }
    })
}

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
        throw new Error(`Yaml file does not exist in folder: ${showPath(folderPath, '/')}`);
    }
}

const showPath = (stringPath, seperator) => {
    let array = stringPath.split('/');
    let start = 0;
    let end = array.length - 2;
    end++;
    return array.slice(start,end).join(seperator);
};

const parseTags = (tags) => {
    let parsedTags;
    tags.forEach((tag, index) => {
        if (index === 0) {
            parsedTags = `\r\n  - ${tag}`;
        }
        else {
            parsedTags = parsedTags + `\r\n  - ${tag}`;
        }
    });
    return parsedTags;
}

const createReadme = (filePath, index) => {
    YAML.load(filePath, (result) => {
        const readmePath = folderPaths[index] + '/README.md';
        const content = `# Bitmovin Demo:\r\n${result.title}\r\n\r\n## Demo Description:\r\n${result.description}\r\n\r\n### Detailed Demo Description:\r\n${result.long_description}\r\n\r\n### Tags:\r\n${parseTags(result.tags)}`;
        fs.writeFile(readmePath, content, (error) => {
            if (error) throw error;
        })
    })
}

const checkAndCreateReadmes = async () => {

await getDirectories();

console.log('Generated all readmes!');
filePaths.forEach((filePath, index) => createReadme(filePath, index));
}

checkAndCreateReadmes();