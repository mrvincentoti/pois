import { Modal } from 'antd';
import React from 'react';

const NewEditCrime = ({ isModalOpen, handleOk, handleCancel, data, modalType }) => {
    return (
        <Modal
            title={modalType === 'add' ? 'Add Item' : 'Edit Item'}
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
