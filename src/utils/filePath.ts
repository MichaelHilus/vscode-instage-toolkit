export function getFolderPathOfPath(path: string): string {
    let fileName = getFileNameOfPath(path);   

    if (fileName === null) {
        return path;
    } else {
        return getFolderPathOfFile(path, fileName);
    }
}

function getFolderPathOfFile(path: string, fileName: string): string {
    return path.substr(0, path.length - (fileName.length + 1));
}

function getFileNameOfPath(path: string): string | null {
    let lastBackslash = path.lastIndexOf('\\') + 1;
    let fileName = path.substr(lastBackslash);

    if (fileName.includes('.')) {
        return fileName;
    }

    return null;
}