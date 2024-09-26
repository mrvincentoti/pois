import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import AppPagination from '../../components/AppPagination';
import NoResult from '../../components/NoResult';
import TableWrapper from '../../container/TableWrapper';
import {
	confirmAction,
	notifyWithIcon,
	formatFullName,
	formatName,
	request,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { DeleteButton, EditButton } from '../../components/Buttons';
import { DELETE_MEDIA_API, FETCH_MEDIA_API } from '../../services/api';
import ManageMedia from '../../modals/ManageMedia';

const Users = () => {
	document.title = `Users - ${APP_SHORT_NAME}`;

	const [fetching, setFetching] = useState(true);
	const [working, setWorking] = useState(false);
	const [list, setList] = useState([]);
	const [meta, setMeta] = useState(paginate);
	const [showModal, setShowModal] = useState(false);
	const [selectedMedia, setSelectedMedia] = useState(null);

	const [page, setPage] = useState(null);
	const [search, setSearch] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [queryLimit, setQueryLimit] = useState(limit);

	const params = useParams();

	const query = useQuery();

	const fetchMedia = useCallback(async (per_page, page, q) => {
		const url = `${FETCH_MEDIA_API}?per_page=${per_page}&page=${page}&q=${q}`;
		try {
			const rs = await request(url.replace(':id', params.id));
			const { media, message, ...rest } = rs;

			setList(media);
			setMeta({ ...rest, per_page });
		} catch (error) {}
	}, []);

	useEffect(() => {
		const _page = Number(query.get('page') || 1);
		const _search = query.get('q') || '';
		const _limit = Number(query.get('entries_per_page') || limit);

		if (
			fetching ||
			_page !== page ||
			_search !== search ||
			_limit !== queryLimit
		) {
			if (_page !== page || _search !== search || _limit !== queryLimit) {
				setFetching(true);
			}

			fetchMedia(_limit, _page, _search).then(_ => {
				setFetching(false);
				setPage(_page);
				setSearch(_search);
				setSearchTerm(_search);
				setQueryLimit(_limit);
			});
		}
	}, [fetchMedia, fetching, page, query, queryLimit, search]);

	const addMedia = () => {
		document.body.classList.add('modal-open');
		setShowModal(true);
	};

	const editMedia = item => {
		document.body.classList.add('modal-open');
		setSelectedMedia(item);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setSelectedMedia(null);
		document.body.classList.remove('modal-open');
	};

	const refreshTable = async () => {
		setWorking(true);
		const _limit = Number(query.get('entries_per_page') || limit);
		await fetchMedia(_limit, 1, '');
	};

	const confirmRemove = item => {
		confirmAction(doRemove, item, 'You want to delete this media');
	};
	const doRemove = async item => {
		try {
			setWorking(true);
			const config = { method: 'DELETE' };
			console.log(item.id);
			const uri = DELETE_MEDIA_API.replaceAll(':id', item.id);
			const rs = await request(uri, config);
			refreshTable();
			notifyWithIcon('success', rs.message);
			setWorking(false);
		} catch (e) {
			notifyWithIcon('error', e.message || 'error, could not delete media');
			setWorking(false);
		}
	};

	const min = useMemo(() => {
		return meta.per_page * (meta.current_page - 1) + 1;
	}, [meta.per_page, meta.current_page]);

	return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-lg-12">
                    <div className="card">
                        <TitleSearchBar
                            title="Media"
                            onClick={() => addMedia()}
                            queryLimit={queryLimit}
                            search={search}
                            searchTerm={searchTerm}
                            onChangeSearch={e => setSearchTerm(e.target.value)}
                            hasCreateBtn={true}
                            createBtnTitle="Add Media"
                        />
                        <div className="card-body">
                            <TableWrapper
                                className="table-responsive table-card"
                                fetching={fetching}
                                working={working}
                            >
                                <table className="table table-borderless align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">File Name</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Size</th>
                                            <th scope="col">Upload Date</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="list">
                                        {list?.map((item, i) => {
                                            return (
                                                <tr key={item.id}>
                                                    {/* {params.id} */}
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <div className="ms-3 flex-grow-1">
                                                                <h6 className="fs-15 mb-0">
                                                                    <a
                                                                        href={item.media_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        {item.media_url}
                                                                    </a>
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>{item.media_type}</td>
                                                    <td>{'--'}</td>
                                                    <td>{item.created_at || '--'}</td>
                                                    <td>
                                                        {/* <DocumentMediaDropDown routes={routes} /> */}
                                                        {/* <div class="flex-shrink-0" onClick={() => showModal('edit')}>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-pencil-fill me-1 align-bottom" style={{ fontSize: '20px' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-download-cloud-2-line me-2 align-middle" style={{ fontSize: '20px', color: '#0eb29c' }}></i>
                                                    </a>
                                                    <a href="javascript:void(0)">
                                                        <i className="ri-delete-bin-line me-2 align-middle" style={{ fontSize: '20px', color: '#f06548' }}></i>
                                                    </a>
                                                </div> */}
                                                        <div className="hstack gap-3 flex-wrap text-end">
                                                            {/* <EditButton
															onClick={() => editMedia(item)}
														/> */}
                                                            <DeleteButton
                                                                onClick={() => confirmRemove(item)}
                                                            />
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {list.length === 0 && (
                                    <div className="noresult py-5">
                                        <NoResult title="Media" />
                                    </div>
                                )}
                            </TableWrapper>
                            <div className="d-flex justify-content-end mt-3">
                                <AppPagination meta={meta} />
                            </div>
                        </div>
                    </div>

                    {showModal && (
                        <ManageMedia
                            id={params.id}
                            selectedMedia={selectedMedia}
                            closeModal={() => closeModal()}
                            update={async () => {
                                await refreshTable().then(_ => setWorking(false));
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
	);
};

export default Users;
