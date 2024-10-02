import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import {
    asyncFetch,
    notifyWithIcon,
    request,
    createHeaders,
} from '../../services/utilities';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';
import {
    FETCH_GENDERS_API,
    FETCH_STATES_API,
    FETCH_CATEGORIES_API,
    FETCH_SOURCES_API,
    FETCH_COUNTRIES_API,
    FETCH_AFFILIATIONS_API,
    GET_ORG_API,
    UPDATE_ORG_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import { Select } from "antd";
import UploadFilePicture from '../../components/UploadFile';

import {
    categoryList,
    confirmationList,
    hasImplications,
    maritalStatusList,
    passportCategoryList,
} from '../../services/constants';
const EditOrganisation = () => {
    const [loaded, setLoaded] = useState(false);
    const [org, setOrg] = useState(null);
    const [dateOfRegistration, setDateOfRegistration] = useState(null);
    const [boardOfDirectors, setBoardOfDirectors] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [operationals, setOperationals] = useState([]);
    const [affiliations, setAffiliations] = useState([]);
    
    // Investors
    const [inputValueInvestors, setInputValueInvestors] = useState('');
    const [editInputIndexInvestors, setEditInputIndexInvestors] = useState(-1);
    const [editInputValueInvestors, setEditInputValueInvestors] = useState('');
    const [inputVisibleInvestors, setInputVisibleInvestors] = useState(false);


    const [state, setState] = useState(null);
    const [maritalStatus, setMaritalStatus] = useState(null);
    const [passportCategory, setPassportCategory] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    
    const [source, setSource] = useState([]);
    const [allAffiliations, setAllAffiliations] = useState([]);
    const [alias, setAlias] = useState([]);

    const [genders, setGenders] = useState([]);
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState(null);
    const [states, setStates] = useState([]);

    const [dateOfBirth, setDateOfBirth] = useState('');
    const [imageUrl, setImageUrl] = useState();
    const [imageString, setImageString] = useState();

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const param = useParams();

    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [fileList, setFileList] = useState([]);

    // Board of directors edit
    const [initialValues, setInitialValues] = useState({ affiliation: [] });
    const showInput2 = () => {
        setInputVisible(true);
    };

    const handleInputChange2 = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm2 = () => {
        if (inputValue && !boardOfDirectors.includes(inputValue)) {
            setBoardOfDirectors([...boardOfDirectors, inputValue]);
        }
        setInputVisible(false);
        setInputValue("");
    };

    const handleRemoveTag2 = (removedTag) => {
        setBoardOfDirectors(boardOfDirectors.filter(tag => tag !== removedTag));
    };

    const fetchApis = useCallback(async () => {
        try {
            const urls = [
                FETCH_GENDERS_API,
                `${FETCH_COUNTRIES_API}?per_page=300`,
                FETCH_CATEGORIES_API,
                FETCH_SOURCES_API,
                FETCH_AFFILIATIONS_API,
            ];
            const requests = urls.map(url =>
                asyncFetch(url).then(response => response.json())
            );
            const [
                rs_genders,
                rs_countries,
                rs_categories,
                rs_sources,
                rs_affiliations,
            ] = await Promise.all(requests);
            setGenders(rs_genders.genders);
            setCountries(rs_countries.countries);
            setCategories(rs_categories.categories);
            setSources(rs_sources.sources);
            setAllAffiliations(rs_affiliations.affiliations);
        } catch (error) {
            notifyWithIcon('error', error.message);
        }
    }, []);

    const fetchStates = useCallback(async country_id => {
        const rs = await request(FETCH_STATES_API.replace('/:id', ''));
        setStates(rs.states);
    }, []);

    const fetchOrg = useCallback(async id => {
        try {
            const rs = await request(GET_ORG_API.replace(':id', id));

            return rs.organisation;
        } catch (error) {
            notifyWithIcon('error', error.message);
        }
    }, []);

    const changeImage = data => {
        setImageUrl(data);
    };

    const handleCloseInvestors = removedTag => {
        const newTags = investors.filter(tag => tag !== removedTag);
        setInvestors(newTags);
    };

    // const handleCloseAffiliation = removedTag => {
    //     const newTags = affiliations.filter(tag => tag !== removedTag);
    //     setAffliations(newTags);
    // };

    const handleInputChangeInvestors = e => {
        setInputValueInvestors(e.target.value);
    };

    const handleInputConfirmInvestors = () => {
        if (inputValueInvestors && !investors.includes(inputValueInvestors)) {
            setInvestors([...investors, inputValueInvestors]);
        }
        setInputVisibleInvestors(false);
        setInputValueInvestors('');
    };

    useEffect(() => {
        if (!loaded) {
            fetchApis();
            fetchOrg(param.id).then(item => {
                console.log(item);

                if (!item) {
                    notifyWithIcon('error', 'poi not found!');
                    navigate('/org/organisation');
                    return;
                }

                if (item.alias) {
                    try {
                        const tagsArray = item.alias.split(',').map(tag => tag.trim());

                        setAlias(tagsArray);
                        setTags(tagsArray);
                    } catch (error) {
                        console.error('Failed to parse alias:', error);

                        const jsonArray = [item.alias];
                        setAlias(jsonArray);
                    }
                }

                setDateOfRegistration(new Date(item.date_of_registration));
                setCountry(item.country);
                setSource(item.source);
                setOrg(item);

                // setInitialValues({
                //     affiliation: item.affiliations.split(',').map(Number),
                //     source: item?.source ? { label: item?.source.name, value: item?.source.id } : '',
                //     country: item?.countries_operational ? item?.countries_operational.split(',').map(item => parseInt(item.trim())) : ''
                // });

                const operational_list = item?.countries_operational.split(',').map(o => {
                    const country = countries.find(c => c.id === Number(o))
                    return { value: Number(o), label: country?.en_short_name || '' }
                })
                setOperationals(operational_list)

                const affiliations_list = item?.affiliations.split(',').map(a => {
                    const affiliation = allAffiliations.find(item => item.id === Number(a))
                    return { label: affiliation?.name || '', value: Number(a) }
                })
                setAffiliations(affiliations_list)

                setBoardOfDirectors(item.board_of_directors.split(',').map(name => name.trim()));
                setInvestors(item.investors.split(',').map(name => name.trim()));
                

                setImageString(item.picture);
                if (item.marital_status)
                    setMaritalStatus(
                        maritalStatusList.find(
                            status => status.name === item.marital_status
                        )
                    );
                setLoaded(true);
            });
        }
    }, [
        fetchApis,
        // fetchDepartments,
        fetchOrg,
        // fetchLgas,
        // fetchUnits,
        loaded,
        navigate,
        countries,
        allAffiliations,
        param.id,
    ]);

    const handleClose = removedTag => {
        const newTags = tags.filter(tag => tag !== removedTag);
        setTags(newTags);
    };

    const showInput = () => {
        setInputVisible(true);
    };

    const showInputInvestors = () => {
        setInputVisibleInvestors(true);
    };

    const handleInputChange = e => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && tags.indexOf(inputValue) === -1) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const forMap = tag => (
        <span key={tag} style={{ display: 'inline-block' }}>
            <Tag closable onClose={() => handleClose(tag)}>
                {tag}
            </Tag>
        </span>
    );

    const tagChild = tags.map(forMap);

    // Function to convert null or undefined values to an empty string
    const convertNullToEmptyString = obj => {
        for (let key in obj) {
            if (obj[key] === null || obj[key] === undefined) {
                obj[key] = ''; // Convert null or undefined to an empty string
            }
        }
    };


    const onSubmit = async values => {
        console.log(values)
        console.log(operationals)
        convertNullToEmptyString(values);

        try {
            // Create a FormData object
            const formData = new FormData();
            // Append your values to FormData

            // if (country) values.country_id = country.id;
            if (maritalStatus) values.marital_status = maritalStatus.name;
            if (dateOfBirth) values.dob = dateOfBirth;
            if (tags) values.alias = tags;

            for (const key in values) {
                formData.append(key, values[key]);
            }

            // Function to append to formData only if the value exists
            const appendIfExists = (key, value) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            };

            if (operationals.length>0){
                formData.append('countries_operational', operationals.map(o => o.value).join(','))
            }

            // Conditionally append values to FormData, with empty strings for non-existent values
            if (values.category) {
                formData.append('category_id', values.category.id);
            }

            if (values.source) {
                formData.append('source_id', values.source?.id || '');
            }
            if (values.gender) {
                formData.append('gender_id', values.gender?.id || '');
            }
            if (values.state) {
                formData.append('state_id', values.state?.id || '');
            }
            if (values.affiliation) {
                formData.append('affiliations', affiliations.map(o => o.value).join(','));
            }
            if (values.marital_status) {
                formData.append('marital_status', values.marital_status?.name || '');
            }
            if (imageUrl) {
                formData.append('picture', imageUrl?.file || ''); // Ensure imageUrl is not null
            }
            if (tags) {
                formData.append('alias', tags.length > 0 ? tags.join(', ') : ''); // Ensure alias is not null
            }

            formData.set('country', undefined)
            formData.set('affiliation', undefined)
            formData.set('source', undefined)

            for (let pair of formData.entries()) {
            	console.log(`${pair[0]}: ${pair[1]}`);
            }

            return

            const uri = UPDATE_ORG_API.replace(':id', param.id);

            const headers = createHeaders(true);
            const response = await fetch(uri, {
                method: 'PUT',
                body: formData,
                headers: headers,
            });

            const data = await response.json();

            if (data.error) {
                let errorMessage = data.error;

                notifyWithIcon('error', errorMessage);
            } else {
                notifyWithIcon('success', 'POI updated successfully');
                navigate('/pois/poi');
            }
        } catch (e) {
            return { [FORM_ERROR]: e.message || 'could not create Poi' };
        }
    };

    // Investors tag

    const forMapInvestors = tag => (
        <span key={tag} style={{ display: 'inline-block' }}>
            <Tag closable onClose={() => handleCloseInvestors(tag)}>
                {tag}
            </Tag>
        </span>
    );
    const tagChildInvestors = investors.map(forMapInvestors);


    // Affiliations
    // const forMapAffiliation = tag => (
    //     <span key={tag} style={{ display: 'inline-block' }}>
    //         <Tag closable onClose={() => handleCloseAffiliation(tag)}>
    //             {tag}
    //         </Tag>
    //     </span>
    // );
    // const tagChildAffiliations = investors.map(forMapAffiliation);

    return (
        <div className="container-fluid">
            <Breadcrumbs pageTitle="EDIT ORG" parentPage="ORG" />
            <div className="row">
                <Form
                    initialValues={{
                        ...org,
                        affiliation: org?.affiliations.split(',')?.map(a => {
                            const affiliation = allAffiliations.find(item => item.id === Number(a))
                            return { label: affiliation?.name || '', value: Number(a) }
                        }) || '',
                        source: org?.source ? { label: org?.source.name, value: org?.source.id } : '',
                        country: org?.countries_operational.split(',')?.map(o => {
                            const country = countries.find(c => c.id === Number(o))
                            return { value: Number(o), label: country?.en_short_name || '' }
                        }) || ''
                    }}
                    onSubmit={onSubmit}
                    validate={values => {
                        // console.log(initialValues);
                        
                        const errors = {};

                        return errors;
                    }}
                    render={({ handleSubmit, submitError, submitting, form }) => (
                        <FormWrapper onSubmit={handleSubmit} submitting={submitting}>
                            <div className="row">
                                <div className="col-lg-12">
                                    <FormSubmitError error={submitError} />
                                </div>
                                <div className="col-lg-8">
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">Personal Information</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="ref_numb">
                                                        Reference Number{' '}
                                                        <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <Field id="ref_numb" name="ref_numb">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="ref_numb"
                                                                placeholder="Enter Reference number"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="ref_numb" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="reg_numb">
                                                        Registration Number <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <Field id="reg_numb" name="reg_numb">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="reg_numb"
                                                                placeholder="Enter registration number"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="reg_numb" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="org_name">
                                                        Organisation Name
                                                    </label>
                                                    <Field id="org_name" name="org_name">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="org_name"
                                                                placeholder="Organisation Name"
                                                            />
                                                        )}
                                                    </Field>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">Technical Information</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="date_of_registration">
                                                        Date Of Registration <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="date_of_registration" name="date_of_registration">
                                                        {({ input, meta }) => (
                                                            <Flatpickr
                                                                className={`form-control ${error(meta)}`}
                                                                options={{
                                                                    dateFormat: 'd M, Y',
                                                                    maxDate: new Date(),
                                                                }}
                                                                placeholder="Select date of birth"
                                                                value={dateOfRegistration}
                                                                onChange={([date]) => {
                                                                    input.onChange(
                                                                        moment(date).format('YYYY-MM-DD')
                                                                    );
                                                                    setDateOfRegistration(date);
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="date_of_registration" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="hq"
                                                    >
                                                        Headquarters
                                                    </label>
                                                    <Field id="hq" name="hq">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="hq"
                                                                placeholder="Enter HQ"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="hq" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="hq"
                                                    >
                                                        Nature Of Business
                                                    </label>
                                                    <Field id="nature_of_business" name="nature_of_business">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="hq"
                                                                placeholder="Nature Of Business"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="nature_of_business" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="country">
                                                        Country Operational <span style={{ color: 'red' }}></span>
                                                    </label>

                                                    <Field id="country" name="country">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                mode="multiple"
                                                                allowClear
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    borderColor: '#ced4da',
                                                                }}
                                                                value={operationals}
                                                                placeholder="Please Country"
                                                                onChange={(value, option) => {
                                                                    input.onChange(value)
                                                                    setOperationals(option)
                                                                }}
                                                                options={countries.map(country => ({
                                                                    value: country.id,
                                                                    label: country.en_short_name,
                                                                }))}
                                                            />
                                                        )}
                                                    </Field>

                                                    <ErrorBlock name="country" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="ceo"
                                                    >
                                                        CEO
                                                    </label>
                                                    <Field id="ceo" name="ceo">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="ceo"
                                                                placeholder="CEO"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="ceo" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="board_of_directors">
                                                        Board Of Directors
                                                    </label>

                                                    <Field id="board_of_directors" name="board_of_directors">
                                                        {({ input, meta }) => (
                                                            <div className={`form-control ${error(meta)}`}>
                                                                {boardOfDirectors.map((director, index) => (
                                                                    <Tag
                                                                        key={index}
                                                                        closable
                                                                        onClose={() => handleRemoveTag2(director)}
                                                                    >
                                                                        {director}
                                                                    </Tag>
                                                                ))}

                                                                {inputVisible && (
                                                                    <Input
                                                                        type="text"
                                                                        size="small"
                                                                        value={inputValue}
                                                                        onChange={handleInputChange}
                                                                        onBlur={handleInputConfirm}
                                                                        onPressEnter={handleInputConfirm}
                                                                        style={{ width: 78, marginRight: 8, marginTop: 5 }}
                                                                    />
                                                                )}

                                                                {!inputVisible && (
                                                                    <Tag onClick={showInput} className="site-tag-plus">
                                                                        <i className="ri-add-line" /> Add
                                                                    </Tag>
                                                                )}

                                                                {/* Hidden input for form submission */}
                                                                <input
                                                                    {...input}
                                                                    type="hidden"
                                                                    value={boardOfDirectors.join(', ')} // Convert array to comma-separated string
                                                                    onChange={() => { }}
                                                                    onBlur={() => input.onBlur(boardOfDirectors.join(', '))}
                                                                />
                                                            </div>
                                                        )}
                                                    </Field>

                                                    <ErrorBlock name="board_of_directors" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="employee_strength"
                                                    >
                                                        Employee Strength
                                                    </label>
                                                    <Field id="employee_strength" name="employee_strength">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="number"
                                                                className={`form-control ${error(meta)}`}
                                                                id="employee_strength"
                                                                placeholder="Employee Strength"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="employee_strength" />
                                                </div>

                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="affiliation">
                                                        Affiliation <span style={{ color: 'red' }}></span>
                                                    </label>

                                                    <Field name="affiliation">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                mode="multiple"
                                                                allowClear
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    borderColor: meta.touched && meta.error ? 'red' : '#ced4da', // Conditional styling
                                                                }}
                                                                placeholder="Please select affiliation"
                                                                onChange={(value, options) => {
                                                                    input.onChange(value); // Update form state
                                                                    setAffiliations(options); // Handle additional logic if necessary
                                                                }}
                                                                options={allAffiliations.map(affiliation => ({
                                                                    value: affiliation.id, // Set the ID as value
                                                                    label: affiliation.name, // Set the name as label
                                                                }))}
                                                                value={affiliations} // Bind the selected values
                                                            />
                                                        )}
                                                    </Field>

                                                    <ErrorBlock name="affiliation" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="investors">
                                                        Investors
                                                    </label>

                                                    <Field id="investors" name="investors">
                                                        {({ input, meta }) => (
                                                            <div className={`form-control ${error(meta)}`}>
                                                                {tagChildInvestors}
                                                                {inputVisibleInvestors && (
                                                                    <Input
                                                                        type="text"
                                                                        size="small"
                                                                        value={inputValueInvestors}
                                                                        onChange={handleInputChangeInvestors}
                                                                        onBlur={handleInputConfirmInvestors}
                                                                        onPressEnter={handleInputConfirmInvestors}
                                                                        style={{ width: 78, marginRight: 8, marginTop: 5 }}
                                                                    />
                                                                )}
                                                                {!inputVisibleInvestors && (
                                                                    <Tag onClick={showInputInvestors} className="site-tag-plus">
                                                                        <i className="ri-add-line" />  Add
                                                                    </Tag>
                                                                )}
                                                                <input
                                                                    {...input}
                                                                    type="hidden"
                                                                    value={investors}
                                                                    onChange={() => { }}
                                                                    onBlur={() => input.onBlur(investors)}
                                                                />
                                                            </div>
                                                        )}
                                                    </Field>

                                                    <ErrorBlock name="investors" />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="phone_number">
                                                        Phone Number
                                                    </label>
                                                    <Field id="phone_number" name="phone_number">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="phone_number"
                                                                placeholder="Phone Number"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="phone_number" />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <Field id="email" name="email">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="email"
                                                                placeholder="Email"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="email" />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="category">
                                                        Category <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="category" name="category">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    borderColor: meta.touched && meta.error ? 'red' : '#ced4da',  // Border color based on validation
                                                                }}
                                                                placeholder="Select Category"
                                                                onChange={(value) => input.onChange(value)}  // Handle change event
                                                                options={categories.map(category => ({
                                                                    value: category.id,  // Map id to value
                                                                    label: category.name,  // Map name to label
                                                                }))}
                                                                className="custom-category-select"  // Custom class for further styling
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="category" />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="source">
                                                        Source <span style={{ color: 'red' }}></span>
                                                    </label>

                                                    <Field id="source" name="source">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    borderColor: meta.touched && meta.error ? 'red' : '#ced4da',  // Dynamic border color based on validation
                                                                }}
                                                                value={input.value || ''}
                                                                placeholder="Select Source"
                                                                onChange={(value) => input.onChange(value)}  // Handle change event
                                                                options={sources.map(s => ({ label:s.name, value:s.id }))}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="source" />
                                                </div>
                                                <div className="col-lg-12 mb-3">
                                                    <label className="form-label" htmlFor="address">
                                                        Address
                                                    </label>
                                                    <Field id="address" name="address">
                                                        {({ input, meta }) => (
                                                            <textarea
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="address"
                                                                placeholder="Enter address"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="address" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">Social Media</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="row">
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="hq"
                                                    >
                                                        Website
                                                    </label>
                                                    <Field id="website" name="website">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="website"
                                                                placeholder="Website"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="website" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="hq"
                                                    >
                                                        Facebook
                                                    </label>
                                                    <Field id="fb" name="fb">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="hq"
                                                                placeholder="Facebook"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="fb" />
                                                </div>
                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="instagram"
                                                    >
                                                        Instagram
                                                    </label>
                                                    <Field id="instagram" name="instagram">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="instagram"
                                                                placeholder="Instagram"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="nature_of_business" />
                                                </div>

                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="twitter"
                                                    >
                                                        X
                                                    </label>
                                                    <Field id="twitter" name="twitter">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="twitter"
                                                                placeholder="X handle"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="twitter" />
                                                </div>

                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="telegram"
                                                    >
                                                        Telegram
                                                    </label>
                                                    <Field id="telegram" name="telegram">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="telegram"
                                                                placeholder="Telegram"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="telegram" />
                                                </div>

                                                <div className="col-lg-4 mb-3">
                                                    <label
                                                        className="form-label"
                                                        htmlFor="tiktok"
                                                    >
                                                        Tiktok
                                                    </label>
                                                    <Field id="tiktok" name="tiktok">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="tiktok"
                                                                placeholder="Tiktok Handle"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="tiktok" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-end mb-4">
                                        <Link to="/pois/poi" className="btn btn-danger w-sm me-1">
                                            Cancel
                                        </Link>
                                        <button type="submit" className="btn btn-success w-sm">
                                            Update POI
                                        </button>
                                    </div>
                                </div>

                                <div className="col-lg-4">
                                    <div className="card mb-3">
                                        <div className="card-header">
                                            <h5 className="card-title mb-0">Picture</h5>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3 text-center">
                                                <UploadFilePicture
                                                    imageString={imageString}
                                                    imageUrl={imageUrl}
                                                    changeImage={data => changeImage(data)}
                                                    style={{ width: '200px', height: '200px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* <div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Crime Information</h5>
										</div>
										<div className="card-body">
											<div className="mb-3">
												<label className="form-label" htmlFor="crime_committed">
													Crime Committed <span style={{ color: 'red' }}>*</span>
												</label>
												<Field id="crime_committed" name="crime_committed">
													{({ input, meta }) => (
														<input
															{...input}
															type="text"
															className={`form-control ${error(meta)}`}
															id="crime_committed"
															placeholder="Enter Crime Committed"
														/>
													)}
												</Field>
												<ErrorBlock name="crime_committed" />
											</div>
											<div className="mb-3">
												<label
													className="form-label"
													htmlFor="crime_date"
												>
													Crime Date{' '}
													<span style={{ color: 'red' }}></span>
												</label>
												<Field
													id="crime_date"
													name="crime_date"
												>
													{({ input, meta }) => (
														<Flatpickr
															className={`form-control ${error(meta)}`}
															options={{
																dateFormat: 'd M, Y',
															}}
															placeholder="Select date of crime"
															value={dateOfEmployment}
															onChange={([date]) => {
																input.onChange(
																	moment(date).format('YYYY-MM-DD')
																);
																setDateOfEmployment(date);
															}}
														/>
													)}
												</Field>
												<ErrorBlock name="crime_date" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="casualties_recorded">
													Casualties Recorded <span style={{ color: 'red' }}></span>
												</label>
												<Field id="casualties_recorded" name="casualties_recorded">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="casualties_recorded"
															placeholder="Casualties Recorded"
														/>
													)}
												</Field>
												<ErrorBlock name="casualties_recorded" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="arresting_body">
													Arresting Body <span style={{ color: 'red' }}></span>
												</label>
												<Field id="arresting_body" name="arresting_body">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="arresting_body"
															placeholder="Arresting Body"
														/>
													)}
												</Field>
												<ErrorBlock name="arresting_body" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="place_of_detention">
													Place of Detention <span style={{ color: 'red' }}></span>
												</label>
												<Field id="place_of_detention" name="place_of_detention">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="place_of_detention"
															placeholder="Place of Detention"
														/>
													)}
												</Field>
												<ErrorBlock name="place_of_detention" />
											</div>
											<div className="mb-3">
												<label className="form-label" htmlFor="action_taken">
													Action taken <span style={{ color: 'red' }}></span>
												</label>
												<Field id="action_taken" name="action_taken">
													{({ input, meta }) => (
														<input
															{...input}
															type="number"
															className={`form-control ${error(meta)}`}
															id="action_taken"
															placeholder="Action taken"
														/>
													)}
												</Field>
												<ErrorBlock name="action_taken" />
											</div>
										</div>
									</div> */}

                                    {/* <div className="card">
										<div className="card-header">
											<h5 className="card-title mb-0">Arms Recovered</h5>
										</div>
										<div className="card-body">
											
										</div>
									</div> */}
                                </div>
                                {/* <div className="col-lg-12">
									<div className="text-end mb-4">
										<Link
											to="/employees/profiles"
											className="btn btn-danger w-sm me-1"
										>
											Cancel
										</Link>
										<button type="submit" className="btn btn-success w-sm">
											Create employee
										</button>
									</div>
								</div> */}
                            </div>
                        </FormWrapper>
                    )}
                />
            </div>
        </div>
    );
};

export default EditOrganisation;
