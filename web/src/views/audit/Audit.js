import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { APP_SHORT_NAME, limit, paginate } from '../../services/constants';
import Breadcrumbs from '../../components/Breadcrumbs';
import NoResult from '../../components/NoResult';
import AppPagination from '../../components/AppPagination';
import data from '../../common/data/audit-trail.json';
import TitleSearchBar from '../../components/TitleSearchBar';
import { useQuery } from "../../hooks/query";
import {
    confirmAction,
    formatDate,
    formatDateTime,
    formatFullName,
    notifyWithIcon,
    request
} from "../../services/utilities";
import { FETCH_AUDITS_API } from "../../services/api";
import { DeleteButton, ViewButton, ViewLink } from "../../components/Buttons";
import ManageEmployeePosting from "../../modals/ManageEmployeePosting";
import ViewLog from "../../modals/ViewLog";
import viewLog from "../../modals/ViewLog";
import AuditFilter from "../../components/AuditFilter";

const Audit = () => {
    document.title = `Audit Trail - ${APP_SHORT_NAME}`;

    const [fetching, setFetching] = useState(true);
    const [working, setWorking] = useState(false);
    const [list, setList] = useState([]);
    const [meta, setMeta] = useState(paginate);
    const [showModal, setShowModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);

    const [filter, setFilter] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);


    const [page, setPage] = useState(null);
    const [search, setSearch] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [queryLimit, setQueryLimit] = useState(limit);

    const query = useQuery();

    const fetchAudit = useCallback(async (per_page, page, q, filters) => {
        try {
            // Update state with filter values
            setFilter(filters);
            const filterParams = new URLSearchParams(filters).toString();
            let rs = "";


            if (filterParams) {

                rs = await request(
                    `${FETCH_AUDITS_API}?q=${q}&${filterParams}`
                );
            } else {
                rs = await request(
                    `${FETCH_AUDITS_API}?per_page=${10}&page=${page}&q=${q}&${filterParams}`
                );
            }
            const { audit, ...rest } = rs;

            setList(audit);
            setMeta({ ...rest, per_page });
            console.log(meta);
            
        } catch (e) {
            notifyWithIcon('error', e.message || 'error, could not fetch audit');
        }
    }, []);

    const handleFilter = useCallback(
        filters => {
            setFilter(filters);

            // Fetch profiles with new filter values
            fetchAudit(queryLimit, page, search, filters).then(_ => {
                setFetching(false);
                setPage(page);
                setSearch(search);
                setSearchTerm(search);
                setQueryLimit(queryLimit);
            });
        },
        [fetchAudit, page, queryLimit, search]
    );

    const handleCloseFilter = useCallback(filters => {
        setIsFilterOpen(false);
    });

    const handleRemoveFilter = useCallback(key => {
        const updatedFilter = { ...filter };
        delete updatedFilter[key];

        setFilter(updatedFilter);

        // Fetch profiles with new filter values
        fetchAudit(queryLimit, page, search, updatedFilter).then(_ => {
            setFetching(false);
            setPage(page);
            setSearch(search);
            setSearchTerm(search);
            setQueryLimit(queryLimit);
        });
    });

    const handleClearFilters = useCallback(() => {
        const updatedFilter = {};

        setFilter(updatedFilter);

        // Fetch profiles with new filter values
        fetchAudit(queryLimit, page, search, updatedFilter).then(_ => {
            setFetching(false);
            setPage(page);
            setSearch(search);
            setSearchTerm(search);
            setQueryLimit(queryLimit);
        });
    });

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

            fetchAudit(_limit, _page, _search).then(_ => {
                setFetching(false);
                setPage(_page);
                setSearch(_search);
                setSearchTerm(_search);
                setQueryLimit(_limit);
            });
        }
    }, [fetchAudit, fetching, page, query, queryLimit, search]);

    const showLog = item => {
        setSelectedLog(item);
        document.body.classList.add('modal-open');
        setShowModal(true);
    };

    const closeModal = () => {
        setSelectedLog(null);
        setShowModal(false);
        document.body.classList.remove('modal-open');
    };



    const refreshTable = async () => {
        setFetching(true);
        const _limit = Number(query.get('entries_per_page') || limit);
        await fetchAudit(_limit, 1, '');
    };

    const min = useMemo(() => {
        return meta.per_page * (meta.current_page - 1) + 1;
    }, [meta.per_page, meta.current_page]);

    return (
        <>
            <div className="container-fluid">
                <Breadcrumbs pageTitle="Audit Trails" parentPage="Audit Trail" />
                <div className="row">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="card">
                                <TitleSearchBar
                                    title="Audit Trails"
                                    onClick={() => { }}
                                    queryLimit={''}
                                    search={search}
                                    searchTerm={searchTerm}
                                    onChangeSearch={e => setSearchTerm(e.target.value)}
                                    hasFilter={true}
                                    openFilter={() => setIsFilterOpen(true)}
                                    filter={filter}
                                    onRemoveFilterTag={handleRemoveFilter}
                                    onClearFilterTag={handleClearFilters}
                                />
                                <div className="card-body">
                                    <div className="table-responsive table-card">
                                        <table className="table align-middle table-nowrap">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>S/N</th>
                                                    <th>IP Address</th>
                                                    <th>Employee</th>
                                                    <th>Module</th>
                                                    <th>Action</th>
                                                    <th>Date</th>
                                                    <th>Detail</th>
                                                </tr>
                                            </thead>
                                            <tbody className="list">
                                                {list.map((item, i) => {
                                                    return (
                                                        <tr key={item.id}>
                                                            <td>{i + min}</td>
                                                            <td>{item.ip_address}</td>
                                                            <td><a
                                                                href={`/employees/${item.employee_id}/view`}
                                                                className="text-reset text-underline"
                                                            >
                                                                <h5 className="fs-14 my-1">
                                                                    {formatFullName(item)}
                                                                </h5>
                                                                <span>{item.pf_num}</span>
                                                            </a></td>
                                                            <td>{item.tags}</td>
                                                            <td>{item.event}</td>
                                                            <td> {formatDateTime(item.updated_at)}</td>
                                                            <td className="text-end">
                                                                <div className="hstack gap-3 flex-wrap text-end">

                                                                    <ViewButton
                                                                        onClick={() => showLog(item)}
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
                                                <NoResult title="Audit Trails" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="d-flex justify-content-end mt-3">
                                        <AppPagination meta={meta} />
                                    </div>

                                </div>
                            </div>

                            {showModal && (
                                <ViewLog
                                    selectedLog={selectedLog}
                                    closeModal={() => closeModal()}
                                    update={async () => {
                                        await refreshTable().then(_ => setFetching(false));
                                    }}
                                />
                            )}
                        </div>

                    </div>

                </div>
            </div>

            <AuditFilter
                filter={filter}
                onFilter={handleFilter}
                show={isFilterOpen}
                onCloseClick={handleCloseFilter}
            />
        </>


    );
};

export default Audit;
