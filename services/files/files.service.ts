import {GetFileData} from './types';
import {Model} from 'mongoose';
import databaseConnectionService from "./db.service"
import {FileInfo} from "../../models/FileInfo";
import fileUpload from "express-fileupload";


const FileInfoModel: Model<FileInfo> = databaseConnectionService.connectToDB();

let LZ4 = require('lz4')
let fs = require('fs');

class FilesService {

    getFileInfo({fileId}: GetFileData) {
        // get file info from database and return it
        return FileInfoModel.findById(fileId, (err: any, res: any) => {
            if (!err) {
                if (res) {
                    console.log('File info for ' + fileId + ' id is downloaded!');
                } else {
                    console.log('File info for ' + fileId + ' id is not found!');
                }
            } else {
                throw err;
            }
        }).clone();
    }

    async uploadFile(uploadedFile: fileUpload.UploadedFile, id: string, expirationMS: number) {
        //insert file info to DB
        const newFile = new FileInfoModel();
        newFile.name = uploadedFile.name;
        newFile.size = uploadedFile.size;
        newFile.mimeType = uploadedFile.mimetype;
        newFile._id = id;
        newFile.uploadDate = new Date();
        let deleteDateMS = new Date().getTime() + expirationMS * 1;
        newFile.deleteDate = new Date(+deleteDateMS);
        newFile.downloads = 0;
        await newFile.save(function (err) {
            if (!err) {
                console.log("Document " + newFile.name + " is inserted to DB successfully!");
            } else {
                throw err;
            }
        });

        //Compress and upload to directory
        let outputData = LZ4.encode(uploadedFile.data, {highCompression: true});
        await fs.writeFile('./uploads/' + id + '.lz4', outputData, (err: any) => {
            if (!err) {
                console.log('File: ./uploads/' + id + '.lz4 is uploaded!');
            } else {
                throw err;
            }
        });
    }

    incrementDownloads(fileId: string) {
        FileInfoModel.findByIdAndUpdate(fileId, {$inc : {'downloads' : 1}}, (err: any) => {
            if (err) {
                throw err;
            }
        });
    }


    downloadFile(fileId: string): Buffer | null {
        let path = './uploads/' + fileId + '.lz4';
        if (!fs.existsSync(path)) {
            console.error("File not found on server");
            return null;
        }
        let compressedContent = fs.readFileSync(path);
        let decompressedContent = LZ4.decode(compressedContent);
        console.log("File " + path + " is downloaded!");
        return decompressedContent;
    }
}

export default new FilesService();
