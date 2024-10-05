import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GET_BRIEF_API, GET_BRIEF_MEDIAS_API } from '../../services/api';
import { notifyWithIcon, request, formatDate, } from '../../services/utilities';
import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import { useQuery } from '../../hooks/query';
import AppPagination from '../../components/AppPagination';
import AddMedia from './AddMedia';


function ViewBrief() {
    const [loaded, setLoaded] = useState(false);
    const [meta, setMeta] = useState(paginate);
    const [briefData, setBriefData] = useState(null);
    const [briefMedia, setBriefMedia] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [working, setWorking] = useState(false);
    const [page, setPage] = useState(null);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [queryLimit, setQueryLimit] = useState(limit);
    const [fetching, setFetching] = useState(true);
    
    const navigate = useNavigate();
    const params = useParams();
    const query = useQuery();

    const fetchBriefDetails = useCallback(async Id => {
        try {
            const rs = await request(GET_BRIEF_API.replace(':id', Id));
            setBriefData(rs.brief);
        } catch (error) {
            throw error;
        }
    }, []);

    const fetchBriefMedia = useCallback(async (Id, per_page, page, q, filters = '') => {
        try {
            const url = `${GET_BRIEF_MEDIAS_API}?per_page=${4}&page=${page}&q=${q}`;
            const rs = await request(url.replace(':id', Id));            
            const { media, pagination, ...rest } = rs;
            setBriefMedia(rs.media);         
            setMeta({ ...pagination });
        } catch (error) {
            throw error;
        }
    }, []);

    useEffect(() => {
        if (!loaded) {
            fetchBriefDetails(params.id)
                .then(_ => setLoaded(true))
                .catch(e => {
                    notifyWithIcon('error', e.message);
                    navigate('/not-found');
                });
        }
    }, [fetchBriefDetails, loaded, navigate, params.id]);

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

            fetchBriefMedia(params.id, _limit, _page, _search).then(() => {
                setFetching(false);
                setPage(_page);
                setSearch(_search);
                setSearchTerm(_search);             
                setQueryLimit(_limit);
            });
        }
    }, [fetchBriefMedia, fetching, page, query, queryLimit, search]);

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
        const _limit = Number(query.get('entries_per_page') || limit);       
        await fetchBriefMedia(params.id);
    };

  return (
      <>
          <div className="container-fluid">
              {/* end row */}
              <div className="row">
                  <div className="col-lg-12">
                      <div className="tab-content text-muted">
                          <div
                              className="tab-pane fade show active"
                              id="project-overview"
                              role="tabpanel"
                          >
                              <div className="row">
                                  <div className="col-xl-8 col-lg-8">
                                      <div className="card">
                                          <div className="card-body">
                                              <div className="text-muted">
                                                  <h6 className="mb-3 fw-semibold text-uppercase">{briefData?.title} <br /> ({briefData?.ref_numb})</h6>
                                                  <hr/>
                                                  <p>
                                                      {briefData?.remark}
                                                  </p>
                                                  
                                                  <div className="pt-3 border-top border-top-dashed mt-4">
                                                      <div className="row">
                                                          <div className="col-lg-3 col-sm-6">
                                                              <div>
                                                                  <p className="mb-2 text-uppercase fw-semibold fs-13">
                                                                      Create Date :
                                                                  </p>
                                                                  <h5 className="fs-15 mb-0">{formatDate(briefData?.created_at)}</h5>
                                                              </div>
                                                          </div>
                                                          <div className="col-lg-3 col-sm-6">
                                                              <div>
                                                                  <p className="mb-2 text-uppercase fw-semibold fs-13">
                                                                      REF NUMBER :
                                                                  </p>
                                                                  <h5 className="fs-15 mb-0">{briefData?.ref_numb}</h5>
                                                              </div>
                                                          </div>
                                                          <div className="col-lg-3 col-sm-6">
                                                              <div>
                                                                  <p className="mb-2 text-uppercase fw-semibold fs-13">
                                                                      Category :
                                                                  </p>
                                                                  <div className="badge bg-danger fs-12">{briefData?.category.name}</div>
                                                              </div>
                                                          </div>
                                                          <div className="col-lg-3 col-sm-6">
                                                              <div>
                                                                  <p className="mb-2 text-uppercase fw-semibold fs-13">
                                                                      Source :
                                                                  </p>
                                                                  <div className="badge bg-warning fs-12">
                                                                      {briefData?.source.name}
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                          {/* end card body */}
                                      </div>
                                      {/* end card */}
                                  </div>
                                  {/* ene col */}
                                  <div className="col-xl-4 col-lg-4">
                                      <div className="card">
                                          <div className="card-header align-items-center d-flex border-bottom-dashed">
                                              <h4 className="card-title mb-0 flex-grow-1">Media/Document</h4>
                                              <div className="flex-shrink-0">
                                                  <button type="button" className="btn btn-soft-info btn-sm" onClick={() => addMedia()}>
                                                      <i className="ri-upload-2-fill me-1 align-bottom" />{" "}
                                                      Upload
                                                  </button>
                                              </div>
                                          </div>
                                          <div className="card-body">
                                              <div className="vstack gap-2">
                                                  {briefMedia?.map((item, i) => {
                                                      return (
                                                          <div className="border rounded border-dashed p-2">
                                                              <div className="d-flex align-items-center">
                                                                  <div className="flex-shrink-0 me-3">
                                                                      <div className="avatar-sm">
                                                                          <div className="avatar-title bg-light text-secondary rounded fs-24">
                                                                              <i className="ri-folder-zip-line" />
                                                                          </div>
                                                                      </div>
                                                                  </div>
                                                                  <div className="flex-grow-1 overflow-hidden">
                                                                      <h5 className="fs-15 mb-1">
                                                                          <a
                                                                              href="#"
                                                                              className="text-body text-truncate d-block"
                                                                          >
                                                                              {item.media_caption}
                                                                          </a>
                                                                      </h5>
                                                                      <div>2.2MB</div>
                                                                  </div>
                                                                  <div className="flex-shrink-0 ms-2">
                                                                      <div className="d-flex gap-1">
                                                                          <button
                                                                              type="button"
                                                                              className="btn btn-icon text-muted btn-sm fs-18"
                                                                          >
                                                                              <i className="ri-download-2-line" />
                                                                          </button>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                              <div className="align-items-center mt-1 pt-2 justify-content-between row text-center text-sm-start">
                                                  <AppPagination meta={meta} />
                                              </div>
                                          </div>
                                          {/* end card body */}
                                      </div>
                                      {/* end card */}
                                  </div>
                                  {/* end col */}
                              </div>
                              {/* end row */}
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
                  </div>
                  {/* end col */}
              </div>
              {/* end row */}
          </div>

      </>
  )
}

export default ViewBrief