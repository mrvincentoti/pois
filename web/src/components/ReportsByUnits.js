import React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Menu, Space } from 'antd';
import ReportByUnitsChart from './ReportByUnitsChart';

const menuItems = [
	{
		key: '1',
		label: 'Today',
	},
	{
		key: '2',
		label: 'Yesterday',
	},
	{
		key: '3',
		label: 'Last 7 Days',
	},
	{
		key: '4',
		label: 'Last 30 Days',
	},
	{
		key: '5',
		label: 'This Month',
	},
	{
		key: '6',
		label: 'Last Month',
	},
];

const ReportsByUnits = ({ poi_activities_by_type }) => {
	const menu = <Menu items={menuItems} />;

	return (
		<div className="card">
			<div className="card-header border-0 align-items-center d-flex">
				<h4 className="card-title mb-0 flex-grow-1">POI Activities By Type</h4>
				<div className="flex-shrink-0">
					<Dropdown overlay={menu} trigger={['click']}>
						<a
							href="#"
							className="text-reset dropdown-btn"
							onClick={e => e.preventDefault()}
						>
							<Space>
								<span className="fw-semibold text-uppercase fs-12">
									Filter by:
								</span>
								<span className="text-muted">
									Today
									<DownOutlined className="ms-1" />
								</span>
							</Space>
						</a>
					</Dropdown>
				</div>
			</div>

			<div className="card-body p-0 pb-2">
				<div className="w-100">
					<ReportByUnitsChart {...{ poi_activities_by_type }} />
				</div>
			</div>
		</div>
	);
};

export default ReportsByUnits;
