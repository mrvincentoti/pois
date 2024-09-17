import React, { useState, useEffect } from 'react';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';

const UploadButton = ({ imageUrl, changeImage }) => {
	const [loading, setLoading] = useState(false);
	const [imgUrl, setImgUrl] = useState();

	const getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};
	const beforeUpload = file => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
		if (!isJpgOrPng) {
			message.error('You can only upload JPG/PNG file!');
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}

		// Convert the file to base64 and save it in the state
		getBase64(file, url => {
			setImgUrl(url);
			changeImage(url);
		});

		return false;
	};

	useEffect(() => {
		if (imageUrl) {
			setImgUrl(imageUrl);
		}
	}, [imageUrl]);

	const handleChange = info => {
		if (info.file.status === 'done' && info.file.originFileObj) {
			setLoading(true);
			getBase64(info.file.originFileObj, url => {
				setImgUrl(url);
				setLoading(false);
			});
		}
	};

	const uploadButton = (
		<button
			style={{
				border: 0,
				background: 'none',
			}}
			type="button"
		>
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div
				style={{
					marginTop: 8,
				}}
			>
				Upload
			</div>
		</button>
	);
	return (
		<>
			<Upload
				name="avatar"
				listType="picture-circle"
				className="avatar-uploader"
				showUploadList={false}
				beforeUpload={beforeUpload}
				onChange={handleChange}
			>
				{imgUrl ? (
					<div
						style={{
							width: '100px', // Set the width and height to the desired size
							height: '100px',
							overflow: 'hidden',
							borderRadius: '50%', // Set border-radius to 50% for a circular shape
						}}
					>
						<img
							src={imgUrl}
							alt="avatar"
							style={{
								width: '100%',
								height: '100%',
								objectFit: 'cover', // Maintain aspect ratio and cover the container
							}}
						/>
					</div>
				) : (
					uploadButton
				)}
			</Upload>
		</>
	);
};
export default UploadButton;
