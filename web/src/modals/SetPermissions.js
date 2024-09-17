import React, { Fragment, useCallback, useEffect, useState } from 'react';
import ModalWrapper from '../container/ModalWrapper';
import { groupBy, notifyWithIcon, request } from '../services/utilities';
import {
	FETCH_ALL_PERMISSIONS_API,
	SET_ROLE_PERMISSIONS_API,
} from '../services/api';
import { FormSubmitError } from '../components/FormBlock';

const SetPermissions = ({ closeModal, update, roleItem }) => {
	const [loaded, setLoaded] = useState(false);
	const [permissions, setPermissions] = useState([]);
	const [permitted, setPermitted] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	const fetchPermissions = useCallback(async () => {
		try {
			const rs = await request(FETCH_ALL_PERMISSIONS_API);
			const items = groupBy(rs.permissions, 'group');
			setPermissions(Object.values(items));
		} catch (error) {
			notifyWithIcon('error', error.message);
		}
	}, []);

	useEffect(() => {
		if (!loaded) {
			fetchPermissions().then(_ => setLoaded(true));
			let items = [];
			for (const permission of roleItem?.permissions || []) {
				items = [
					...items,
					{ permission_id: permission.id, module_id: permission.module_id },
				];
			}
			setPermitted(items);
		}
	}, [fetchPermissions, loaded, roleItem]);

	const onSelectPermission = item => {
		const permission = permitted.find(p => p.permission_id === item.id);
		let items = permitted;
		if (!permission) {
			items = [
				...items,
				{ permission_id: item.id, module_id: item.module?.id },
			];
		} else {
			items = items.filter(i => i.permission_id !== item.id);
		}

		setPermitted(items);
	};

	const syncPermissions = async e => {
		try {
			e.preventDefault();
			if (permitted.length === 0) {
				notifyWithIcon('warning', 'Select a permission');
				return;
			}
			setErrorMessage('');
			const config = { method: 'POST', body: { permissions: permitted } };
			const rs = await request(
				SET_ROLE_PERMISSIONS_API.replace(':id', roleItem.id),
				config
			);
			notifyWithIcon('success', rs.message);
			update();
			closeModal();
		} catch (e) {
			const message = e.message || 'could not save permissions';
			setErrorMessage(message);
		}
	};

	return (
		<ModalWrapper
			title={`Set Permissions for ${roleItem.name}`}
			width="modal-xl"
			closeModal={closeModal}
		>
			<div className="modal-body">
				<FormSubmitError error={errorMessage} />
				{permissions.map((items, i) => {
					const singleItem = items[0];
					return (
						<Fragment key={i}>
							<h5 className="card-title text-capitalize">
								{singleItem?.group?.replace('-', ' ') || ''}
							</h5>
							<div className="row mt-2 mb-4">
								<div className="col-md-12">
									{items.map((item, j) => {
										const find_permission = permitted.find(
											p => p.permission_id === item.id
										);
										const is_permitted = find_permission || false;
										return (
											<div
												key={j}
												className="form-check form-switch form-check-inline"
												onClick={() => onSelectPermission(item)}
												role="button"
												tabIndex={Number(`${i}${j}`)}
											>
												<input
													className="form-check-input"
													type="checkbox"
													checked={is_permitted}
													readOnly
												/>
												<label className="form-check-label" htmlFor="">
													{item.description}
												</label>
											</div>
										);
									})}
								</div>
							</div>
						</Fragment>
					);
				})}
			</div>
			<div className="modal-footer">
				<div className="hstack gap-2 justify-content-end">
					<button
						type="submit"
						className="btn btn-success"
						onClick={syncPermissions}
					>
						Save Changes
					</button>
					<button
						type="submit"
						className="btn btn-dark"
						onClick={() => closeModal()}
					>
						Close
					</button>
				</div>
			</div>
		</ModalWrapper>
	);
};

export default SetPermissions;
