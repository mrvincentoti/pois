import React, {useEffect} from 'react';
import ModalWrapper from '../container/ModalWrapper';

const ActivityDetails = ({ closeModal, activity }) => { 
    useEffect(() => {
        console.log(activity);
        
    }, []);

    return (
        <ModalWrapper title="Activity Details" width={'modal-xl'} closeModal={closeModal}>
            <div className="modal-body">
                <div className="row g-3">
                    <div className="table-responsive">
                        <table className="table table-bordered border-secondary table-nowrap align-middle mb-0">
                            <tbody>
                                {activity?.title && <tr>
                                    <td className="text-black">Title</td>
                                    <td><span className="text-muted">{ activity?.title }</span></td>
                                </tr>}
                                {activity?.activity_date && <tr>
                                    <td className="text-black">Activity Date</td>
                                    <td><span className="text-muted">{ activity?.activity_date  }</span></td>
                                </tr>}
                                {activity?.location && <tr>
                                    <td className="text-black">Location</td>
                                    <td><span className="text-muted">{activity?.location }</span></td>
                                </tr>}
                                {activity?.location_from && <tr>
                                    <td className="text-black">Location From</td>
                                    <td><span className="text-muted">{activity?.location_from }</span></td>
                                </tr>}
                                {activity?.location_to && <tr>
                                    <td className="text-black">Location To</td>
                                    <td><span className="text-muted">{activity?.location_to }</span></td>
                                </tr>}
                                {activity?.crime && <tr>
                                    <td className="text-black">Crime</td>
                                    <td><span className="text-muted">{ activity?.crime.name }</span></td>
                                </tr>}
                                {activity?.nature_of_attack && <tr>
                                    <td className="text-black">Nature Of Attack</td>
                                    <td><span className="text-muted">{activity?.nature_of_attack }</span></td>
                                </tr>}
                                {activity?.casualties_recorded && <tr>
                                    <td className="text-black">Casualties Recorded</td>
                                    <td><span className="text-muted">{activity?.casualties_recorded}</span></td>
                                </tr>}
                                {activity?.action_taken && <tr>
                                    <td className="text-black">Action Taken</td>
                                    <td><span className="text-muted">{ activity?.action_taken }</span></td>
                                </tr>}
                                {activity?.facilitator && <tr>
                                    <td className="text-black">Facilitator</td>
                                    <td><span className="text-muted">{ activity?.facilitator}</span></td>
                                </tr>}
                                {activity?.remark && <tr>
                                    <td className="text-black">Assessment</td>
                                    <td><span className="text-muted">{ activity?.remark }</span></td>
                                </tr>}
                            </tbody>
                        </table>
                    </div>
                    {
                        activity?.items && activity?.items.length > 0 &&
                        <>
                            <h5>Items</h5>
                            <div className="table-responsive">
                                <table className="table table-bordered border-secondary table-nowrap align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th scope="col">Item</th>
                                            <th scope="col">Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activity?.items?.length > 0 ? (
                                            activity.items.map((item, index) => (
                                                <>
                                                    <tr key={index}>
                                                        <td className="text-black">{ item.item }</td>
                                                        <td><span className="text-muted">{item?.qty || 'N/A'}</span></td>
                                                    </tr>
                                                </>
                                            ))
                                        ) : (
                                            <p className="form-control-plaintext">No items available</p>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    }

                    {
                        activity?.media_files?.length > 0 ?
                            (
                                <>
                                    <h5>Media Files</h5>
                                    <div className="col-lg-12" style={{ marginTop: '20px' }}>
                                        <div className="row">
                                            <div className="col-xl-12 col-lg-12">
                                                <div className="row g-2">
                                                    {activity.media_files.map((file, index) => (
                                                        <div className="col-md-3 col-sm-6">
                                                            <div>
                                                                <a
                                                                    href={file.media_url}
                                                                    className="image-popup d-block"
                                                                    target="_blank"
                                                                >
                                                                    <img
                                                                        src={file.media_url}
                                                                        alt="media url"
                                                                        className="img-fluid d-block rounded"
                                                                        style={{height: '200px'}}
                                                                    />
                                                                </a>
                                                            </div>
                                                            <div className="box-content">
                                                                <div className="d-flex align-items-center mt-1">
                                                                    <div className="flex-grow-1 text-muted"><a href="" className="text-body text-truncate">{file.media_caption}</a></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
                            : 
                            (
                                <p className="form-control-plaintext">
                                    No media files available
                                </p>
                            )
                    }
                </div>
            </div>
        </ModalWrapper>
    );
};

export default ActivityDetails;
