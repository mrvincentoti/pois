import React from 'react';
import Spin from 'antd/es/spin';
import { antIcon } from '../services/utilities';

const FormWrapper = ({ submitting, onSubmit, children }) => {
	return (
		<Spin spinning={submitting} indicator={antIcon}>
			<form onSubmit={onSubmit} autoComplete="off">
				{children}
			</form>
		</Spin>
	);
};

export default FormWrapper;
