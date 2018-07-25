const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

let folderPaths = [];
let filePaths = [];

const getDirectories = (filePath = './') => {
    fs.readdirSync(filePath).map(folder => {
        const folderPath = path.join(filePath, folder)
        if (fs.statSync(folderPath).isDirectory() && folder !== '.git' && folder !== 'node_modules' && folder !== '.travis') {
            folderWalk(folderPath);
        }
    })
};

const folderWalk = (folderPath) => {
    fs.readdirSync(folderPath).map(subfolder => {
        if (subfolder !== '.DS_Store') {
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
        console.error(`Yaml file does not exist in folder: ${showPath(folderPath, '/')}!`);
        process.exit(1);
    }
};

const showPath = (stringPath, seperator) => {
    let array = stringPath.split('/');
    let start = 0;
    let end = array.length - 2;
    end++;
    return array.slice(start, end).join(seperator);
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

            let readmeResult = data.replace(/{{title}}|{{description}}|{{long_description}}/gi, (matched) => {
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

const checkAndCreateReadmes = async () => {

    await getDirectories();

    filePaths.forEach((filePath, index) => createReadme(filePath, index));
    console.log('All readmes present!');
};

const checkReadmes = () => {
    folderPaths.forEach((folderPath) => {
        if (fs.statSync(folderPath).isDirectory() && fs.existsSync(path.join(folderPath, 'README.md'))) {
            return;
        }
        else {
            console.log(folderPath);
            console.error(`Readme file does not exist in folder: ${showPath(folderPath, '/')}!`);
            process.exit(1);
        }
    })
};

const createReadmesPromise = new Promise(() => {
    return checkAndCreateReadmes();
})

Promise.resolve(createReadmesPromise).then(() => {
    checkReadmes();
})
