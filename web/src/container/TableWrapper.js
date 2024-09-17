import React from 'react';
import Spin from 'antd/es/spin';
import { antIconSync } from '../services/utilities';

const TableWrapper = ({ className, fetching, working = false, children }) => {
	return (
		<div className={className}>
			{fetching ? (
				<Spin spinning={true} indicator={antIconSync}>
					<div className="fetching" />
				</Spin>
			) : (
				<Spin spinning={working} indicator={antIconSync}>
					{children}
				</Spin>
			)}
		</div>
	);
};

export default TableWrapper;
