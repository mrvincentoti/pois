import React from 'react';
import Chart from 'react-apexcharts';

const StatEmployeeChart = ({ statistics, categories }) => {
	const options = {
		chart: {
			id: 'mixed-chart',
			type: 'line',
		},
		xaxis: {
			categories: [...categories],
		},
		yaxis: [
			{
				title: {
					text: 'Total Count',
				},
				tooltip: {
					enabled: true,
				},
			},
			{
				opposite: true,
				title: {
					text: 'Total Count',
				},
			},
		],
		tooltip: {
			fixed: {
				enabled: false,
				position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
				offsetY: 30,
				offsetX: 60,
			},
		},
		width: '100%',
		colors: ['#695eef', '#11d1b7'],
		plotOptions: {
			bar: {
				borderRadius: 0,
				columnWidth: '20%',
			},
		},
	};

	return (
		<div className="card">
			<div className="card-header border-0 align-items-center d-flex">
				<h4 className="card-title mb-0 flex-grow-1">
					Employees vs Retiring Employees per Directorate
				</h4>
			</div>
			<div className="card-body p-0 pb-2">
				<div className="w-100">
					<div
						id="customer_impression_charts"
						data-colors='["--vz-info", "--vz-primary", "--vz-danger"]'
						className="apex-charts"
					>
						<Chart
							options={options}
							series={statistics}
							type="bar"
							width="100%"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatEmployeeChart;
