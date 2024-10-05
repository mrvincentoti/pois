import React, { useEffect, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Select from 'react-select';
import ModalWrapper from '../../container/ModalWrapper';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { notifyWithIcon, request, createHeaders } from '../../services/utilities';
import preview from '../../assets/images/no-preview-available.png';
import {
    CREATE_ORG_MEDIA_API,
    UPDATE_ORG_MEDIA_API,
    FETCH_ORG_MEDIA_API,
    UPDATE_BRIEF_MEDIA_API,
    CREATE_BRIEF_MEDIA_API
} from '../../services/api';
import { Button, message, Upload, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';

const PreviewMedia = ({ id, closeModal, update, media, selectedMedia }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const params = useParams();

    console.log(id);
    console.log(selectedMedia);
    
    const onSubmit = async values => {
        try {
            const formData = new FormData();
            formData.append('file', fileList[0]);
            formData.append('media_caption', values.caption);
            //console.log(params.id); return;

            // for (let pair of formData.entries()) {
            // 	console.log(`${pair[0]}: ${pair[1]}`);
            // }

            // return
            const uri = media
                ? UPDATE_BRIEF_MEDIA_API.replace(':id', id)
                : CREATE_BRIEF_MEDIA_API.replace(':id', id);
            //console.log(uri); return;


            const headers = createHeaders(true);
            const response = await fetch(uri, {
                method: 'POST',
                body: formData,
                headers: headers,
            });

            const data = await response.json();


            if (data.error) {
                let errorMessage = data.error;

                notifyWithIcon('error', errorMessage);
            } else {
                notifyWithIcon('success', ' uploaded successfully');
            }

            update();
            closeModal();
        } catch (e) {
            return {
                [FORM_ERROR]: e.message || 'Could not save media',
            };
        }
    };

    const props = {
        maxCount: 1,
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },
        beforeUpload: file => {
            setFileList([file]);
        },
        fileList,
    };

    const renderMediaPreview = () => {
        if (selectedMedia?.media_type.startsWith('image')) {
            return <img src={selectedMedia?.media_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />;
        }

        // if (selectedMedia.media_type === 'application/pdf') {
        //     return (
        //         <Document file={mediaUrl}>
        //             <Page pageNumber={1} />
        //         </Document>
        //     );
        // }

        // if (selectedMedia.media_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        //     return <DocViewer documents={[{ uri: mediaUrl }]} />;
        // }

        return <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />;
    };

    return (
        <ModalWrapper
            title={`${media ? 'Preview' : 'Preview'} Media`}
            closeModal={closeModal}
        >
            <div>{renderMediaPreview()}</div>
        </ModalWrapper>
    );
};

export default PreviewMedia;
