import React from 'react';
import noresult from '../assets/json/msoeawqm.json';

const NoResult = ({ title }) => {
	return (
		<div className="text-center">
			<lord-icon
				src={noresult}
				trigger="loop"
				colors="primary:#121331,secondary:#08a88a"
				style={{
					width: '75px',
					height: '75px',
				}}
			></lord-icon>
			<h5 className="mt-2">Sorry! No Data Found</h5>
			<p className="text-muted mb-0">
				We've searched through your records, We did not find any {title}.
			</p>
		</div>
	);
};

export default NoResult;
