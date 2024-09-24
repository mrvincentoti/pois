// DateRange.js
import React from 'react';
import { DatePicker, Space } from 'antd';
import './DateRange.css';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD';

const DateRange = () => (
	<Space direction="vertical" size={12}>
		<RangePicker format={dateFormat} />
	</Space>
);

export default DateRange;
