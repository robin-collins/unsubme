const fs = require('fs');
const path = require('path');

// Array of directories to exclude
const excludeDirs = ['node_modules', 'tmp', '.git'];

/**
 * Recursively get all files in a directory and its subdirectories.
 * @param {string} dir - The directory to search.
 * @param {Array} fileList - The list of files found.
 * @returns {Array} The list of files with their paths.
 */
function getAllFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!excludeDirs.includes(file)) {
                getAllFiles(filePath, fileList);
            }
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

/**
 * Get the file sizes and sort them in descending order.
 * @param {Array} files - The list of files with their paths.
 * @returns {Array} The sorted list of files with sizes.
 */
function getFileSizes(files) {
    return files
        .map(file => {
            const stats = fs.statSync(file);
            return { path: file, size: stats.size };
        })
        .sort((a, b) => b.size - a.size);
}

/**
 * Main function to list files in descending order of size.
 */
function listFilesBySize() {
    try {
        const dir = './'; // Starting directory
        const allFiles = getAllFiles(dir);
        const sortedFiles = getFileSizes(allFiles);

        sortedFiles.forEach(file => {
            console.log(`${file.path} - ${file.size} bytes`);
        });
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

// Execute the main function
listFilesBySize();
