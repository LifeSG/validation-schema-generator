/// <reference types="node" />
export declare namespace FileHelper {
    /**
     * estimate filesize from base64 string
     * https://stackoverflow.com/questions/53228948/how-to-get-image-file-size-from-base-64-string-in-javascript#answer-53229045
     */
    const getFilesizeFromBase64: (base64: string) => number;
    /**
     * convert array of file extensions to a proper sentence
     * convert to uppercase
     * joins array with comma
     * add `or` before last extension
     * lists both .JPG and .JPEG
     */
    const extensionsToSentence: (list: string[]) => string;
    /**
     * converts file extension to mime type
     */
    const fileExtensionToMimeType: (ext: string) => string | undefined;
    /**
     * reliably derive mime type by checking magic number of the buffer
     */
    const getMimeType: (buffer: Buffer) => Promise<import("file-type/core").MimeType>;
}
