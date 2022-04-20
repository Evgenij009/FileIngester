import { makeAutoObservable } from 'mobx';

export const fileStorageTimeVariants = ['1 день', '7 дней', '14 дней'];

export enum UploadStatus {
    NO_FILE,
    UPLOADING,
    ERROR,
    UPLOADED,
}

class FilesStore {
    file: File | null = null;
    storageTime: string = fileStorageTimeVariants[0];
    status: UploadStatus = UploadStatus.NO_FILE;

    constructor() {
        makeAutoObservable(this);
    }

    setFile(file: File) {
        this.file = file;
    }

    setSotrageTime(storageTime: string) {
        this.storageTime = storageTime;
    }

    setStatus(status: UploadStatus) {
        this.status = status;
    }
}

export default FilesStore;
