import React from 'react';

const Breadcrumbs = ({ pageTitle, parentPage }) => {
	return (
		<div className="row">
			<div className="col-12">
				<div className="page-title-box d-sm-flex align-items-center justify-content-between">
					<h4 className="mb-sm-0">{pageTitle}</h4>

					<div className="page-title-right">
						<ol className="breadcrumb m-0">
							{parentPage !== '' ? (
								<>
									<li className="breadcrumb-item">
										<a className="pointer">{parentPage}</a>
									</li>
									<li className="breadcrumb-item active">{pageTitle}</li>
								</>
							) : (
								<li className="breadcrumb-item">
									<a className="pointer">{pageTitle}</a>
								</li>
							)}
						</ol>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Breadcrumbs;
