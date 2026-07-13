import {_POST} from './rest.service.wrapper';

export const UploadFile = async (url,file) => {
    return _POST(url, { file }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
    });
}

export const DeleteFile = async (url,filename) => {
    return _POST(url, { filename });
}