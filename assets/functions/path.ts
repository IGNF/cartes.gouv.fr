const getFileExtension = (filename: string) => {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase();
};

const path = {
    getFileExtension,
};

export default path;
