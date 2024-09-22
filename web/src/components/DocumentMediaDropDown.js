import React from 'react';
import { Dropdown, Menu } from 'antd';
import { PicRightOutlined } from '@ant-design/icons';

const DocumentMediaDropDown = ({ routes }) => {
    const menu = (
        <Menu>
            <Menu.Item key="1">
                <a href={routes.view}>
                    <i className="ri-eye-fill me-2 align-middle"></i> View
                </a>
            </Menu.Item>
            <Menu.Item key="2">
                <a href={routes.download}>
                    <i className="ri-download-2-fill me-2 align-middle"></i> Download
                </a>
            </Menu.Item>
            <Menu.Item key="3">
                <a href={routes.delete}>
                    <i className="ri-delete-bin-5-line me-2 align-middle"></i> Delete
                </a>
            </Menu.Item>
        </Menu>
    );

    return (
        <Dropdown overlay={menu} trigger={['click']}>
            <a
                href="#!"
                className="ant-dropdown-link btn btn-light btn-icon"
                onClick={e => e.preventDefault()}
            >
                <PicRightOutlined />
            </a>
        </Dropdown>
    );
};

export default DocumentMediaDropDown;