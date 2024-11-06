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

const PreviewMedia = ({ id, closeModalMedia, update, media, selectedMediaFile }) => {
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const params = useParams();
    

    const renderMediaPreview = () => {
        console.log(selectedMediaFile);
        
        if (selectedMediaFile?.media_type.startsWith('image')) {
            return <img src={selectedMediaFile?.media_url} alt="Preview" style={{ width: '100%', height: '100%' }} />;
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
            title={`${media ? 'Preview' : selectedMediaFile?.media_caption}`}
            closeModal={closeModalMedia}
        >
            <div>{renderMediaPreview()}</div>
        </ModalWrapper>
    );
};

export default PreviewMedia;
