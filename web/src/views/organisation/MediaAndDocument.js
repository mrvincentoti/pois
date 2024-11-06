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
    request,
    formatCaption,
    formatType,
    getMediaDetails,
} from '../../services/utilities';
import { useQuery } from '../../hooks/query';
import TitleSearchBar from '../../components/TitleSearchBar';
import { DeleteButton, EditButton } from '../../components/Buttons';
import { DELETE_ORG_MEDIA_API, FETCH_ORG_MEDIA_API } from '../../services/api';
import AddMedia from './AddMedia';
import PreviewMedia from './PreviewMedia';

// PreviewModal Component
const PreviewModal = ({ media, onClose }) => {
    return (
        <div className="modal show" tabIndex="-1" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Media Preview</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        {media?.media_type === 'image' && (
                            <img
                                src={media.media_url}
                                alt={media.media_caption}
                                style={{ width: '100%' }}
                            />
                        )}
                        {media?.media_type === 'pdf' && (
                            <iframe
                                src={media.media_url}
                                title={media.media_caption}
                                style={{ width: '100%', height: '500px' }}
                            />
                        )}
                        {media?.media_type === 'excel' && (
                            <a
                                href={media.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download Excel File
                            </a>
                        )}
                        {/* Handle other media types as needed */}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main MediaAndDocument Component
const MediaAndDocument = () => {
    document.title = `Media - ${APP_SHORT_NAME}`;

    const [fetching, setFetching] = useState(true);
    const [working, setWorking] = useState(false);
    const [list, setList] = useState([]);
    const [meta, setMeta] = useState(paginate);
    const [showModal, setShowModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);

	const [showPreview, setShowPreview] = useState(false);
	const [mediaForPreview, setMediaForPreview] = useState(null);
	const [showPreviewModal, setShowPreviewModal] = useState(false);
	const [selectedMediaFile, setSelectedMediaFile] = useState(null);

    const [page, setPage] = useState(null);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [queryLimit, setQueryLimit] = useState(limit);

    const params = useParams();
    const query = useQuery();

    const fetchMedia = useCallback(async (per_page, page, q) => {
        try {
            const url = `${FETCH_ORG_MEDIA_API}?per_page=${per_page}&page=${page}&q=${q}`;
            const rs = await request(url.replace(':id', params.id));
            const { media, message, ...rest } = rs;
            
            setList(media);
            setMeta({ ...rest, per_page });
        } catch (error) {
            console.error('Error fetching media:', error);
        }
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

            fetchMedia(_limit, _page, _search).then(() => {
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
            const uri = DELETE_ORG_MEDIA_API.replaceAll(':id', item.media_id);
            const rs = await request(uri, config);
            refreshTable();
            notifyWithIcon('success', rs.message);
            setWorking(false);
        } catch (e) {
            notifyWithIcon('error', e.message || 'Error: Could not delete media');
            setWorking(false);
        }
    };

    const min = useMemo(() => {
        return meta.per_page * (meta.current_page - 1) + 1;
    }, [meta.per_page, meta.current_page]);

    const previewMedia = item => {
			document.body.classList.add('modal-open');
			setSelectedMediaFile(item);
			setShowPreviewModal(true);
		};

		const closeModalMedia = () => {
			setShowPreviewModal(false);
			setSelectedMediaFile(null);
			//refreshTable();
			document.body.classList.remove('modal-open');
        };
    
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
									working={working}>
									<table className="table table-borderless align-middle mb-0">
										<thead className="table-light">
											<tr>
												<th scope="col">Caption</th>
												<th scope="col">Source</th>
												<th scope="col">Type</th>
												<th scope="col">Size</th>
												<th scope="col">Upload Date</th>
												<th scope="col">Action</th>
											</tr>
										</thead>
										<tbody className="list">
											{list?.map((item, i) => (
												<tr key={i}>
													<td>
														<div className="d-flex align-items-center">
															<div className="avatar-sm">
																<div
																	className={`avatar-title bg-primary-subtle ${
																		getMediaDetails(item.media_type).colorClass
																	} rounded fs-20`}>
																	<i
																		className={
																			getMediaDetails(item.media_type).icon
																		}></i>
																</div>
															</div>
															<div className="ms-3 flex-grow-1">
																<h6 className="fs-15 mb-0">
																	<a
																		href="javascript:void(0)"
																		className="text-body"
																		onClick={() => {
																			setMediaForPreview(item);
																			setShowPreview(true);
																		}}>
																		{formatCaption(item.media_caption)}
																	</a>
																</h6>
															</div>
														</div>
													</td>
													<td>
														{item.org_id ? (
															<span className="badge border border-warning text-warning">
																Organisation
															</span>
														) : (
															<span className="badge border border-success text-success">
																{item.source || '--'}
															</span>
														)}
													</td>
													<td>{formatType(item.media_type)} File</td>
													<td>{item.file_size || '--'}</td>
													<td>{item.created_at || '--'}</td>
													<td>
														<div className="hstack gap-3 flex-wrap text-end">
															<button
																onClick={() => previewMedia(item)}
																type="button"
																className="btn btn-icon text-muted btn-sm fs-18">
																<i
																	className="ri-eye-2-line"
																	style={{ color: '#11d1b7' }}
																/>
															</button>
															<DeleteButton
																onClick={() => confirmRemove(item)}
															/>
														</div>
													</td>
												</tr>
											))}
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
							<AddMedia
								id={params.id}
								selectedMedia={selectedMedia}
								closeModal={() => closeModal()}
								update={async () => {
									await refreshTable().then(() => setWorking(false));
								}}
							/>
						)}

						{showPreview && (
							<PreviewModal
								media={mediaForPreview}
								onClose={() => {
									setShowPreview(false);
									setMediaForPreview(null);
								}}
							/>
						)}

						{showPreviewModal && (
							<PreviewMedia
								id={params.id}
								selectedMediaFile={selectedMediaFile}
								closeModalMedia={() => closeModalMedia()}
								update={async () => {
									await refreshTable().then(() => setWorking(false));
								}}
							/>
						)}
					</div>
				</div>
			</div>
		);
};

export default MediaAndDocument;
