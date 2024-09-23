import { Modal } from 'antd';
import React from 'react';

const NewEditCrime = ({ isModalOpen, handleOk, handleCancel, data, modalType }) => {
    return (
        <Modal
            title={modalType === 'add' ? 'New Crime Committed' : 'Edit Crime Committed'}
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <p>{modalType === 'add' ? 'Add new item here' : 'Edit the item'}</p>
            <p>{data}</p>
        </Modal>
    );
};

export default NewEditCrime;
