import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { asyncFetch, notifyWithIcon, request } from '../../services/utilities';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { Flex, Input, Tag, theme, Tooltip } from 'antd';
import { message, Upload } from 'antd';

import {
    CREATE_ORG_API,
    FETCH_CATEGORIES_API,
    FETCH_SOURCES_API,
    FETCH_COUNTRIES_API,
    FETCH_AFFILIATIONS_API,
} from '../../services/api';
import Flatpickr from 'react-flatpickr';
import moment from 'moment';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import UploadButton from '../../components/UploadItem';
import {
    categoryList,
    confirmationList,
    hasImplications,
    maritalStatusList,
    passportCategoryList,
} from '../../services/constants';

const NewOrganisation = () => {
    const [loaded, setLoaded] = useState(false);
    const [dateOfRegistration, setDateOfRegistration] = useState(null);
    const [stateOrigin, setStateOrigin] = useState(null);
    const [maritalStatus, setMaritalStatus] = useState(null);
    const [passportCategory, setPassportCategory] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [category, setCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);

    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState(null);

    const [imageUrl, setImageUrl] = useState();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { token } = theme.useToken();

    const [boardOfDirectors, setBoardOfDirectors] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    // Investors
    const [inputValueInvestors, setInputValueInvestors] = useState('');
    const [editInputIndexInvestors, setEditInputIndexInvestors] = useState(-1);
    const [editInputValueInvestors, setEditInputValueInvestors] = useState('');
    const [inputVisibleInvestors, setInputVisibleInvestors] = useState(false);

    // Affiliation
    const [inputValueAffiliation, setInputValueAffiliation] = useState('');
    const [editInputIndexAffiliation, setEditInputIndexAffiliation] = useState(-1);
    const [editInputValueAffiliation, setEditInputValueAffiliation] = useState('');
    const [inputVisibleAffiliation, setInputVisibleAffiliation] = useState(false);
    const [affiliations, setAffliations] = useState([]);

    const handleCloseAffiliation = removedTag => {
        const newTags = affiliations.filter(tag => tag !== removedTag);
        setAffliations(newTags);
    };

    const showInputAffiliation = () => {
        setInputVisibleAffiliation(true);
    };

    const handleInputChangeAffiliation = e => {
        setInputValueAffiliation(e.target.value);
    };

    const handleInputConfirmAffiliation = () => {
        if (inputValueAffiliation && !affiliations.includes(inputValueAffiliation)) {
            setAffliations([...affiliations, inputValueAffiliation]);
        }
        setInputVisibleAffiliation(false);
        setInputValueAffiliation('');
    };

    const handleEditInputConfirmAffiliation = () => {
        const newTags = [...affiliations];
        newTags[editInputIndexAffiliation] = editInputValueAffiliation;
        setAffliations(newTags);
        setEditInputIndexAffiliation(-1);
        setEditInputValueAffiliation('');
    };

    const [selectedAffiliations, setSelectedAffiliations] = useState([]);

    const handleChangeAff = (selectedOptions) => {
        setSelectedAffiliations(selectedOptions);
    };

    // End affiliation

    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);

    useEffect(() => {
        editInputRef.current?.focus();
    }, [editInputValue]);

    const handleClose = removedTag => {
        const newTags = boardOfDirectors.filter(tag => tag !== removedTag);
        setBoardOfDirectors(newTags);
    };

    const handleCloseInvestors = removedTag => {
        const newTags = investors.filter(tag => tag !== removedTag);
        setInvestors(newTags);
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

    const handleInputChangeInvestors = e => {
        setInputValueInvestors(e.target.value);
    };

    const handleInputConfirm = () => {
        if (inputValue && !boardOfDirectors.includes(inputValue)) {
            setBoardOfDirectors([...boardOfDirectors, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };

    const handleInputConfirmInvestors = () => {
        if (inputValueInvestors && !investors.includes(inputValueInvestors)) {
            setInvestors([...investors, inputValueInvestors]);
        }
        setInputVisibleInvestors(false);
        setInputValueInvestors('');
    };

    const handleEditInputChange = e => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        const newTags = [...boardOfDirectors];
        newTags[editInputIndex] = editInputValue;
        setBoardOfDirectors(newTags);
        setEditInputIndex(-1);
        setEditInputValue('');
    };

    const handleEditInputConfirmInvestors = () => {
        const newTags = [...investors];
        newTags[editInputIndexInvestors] = editInputValueInvestors;
        setInvestors(newTags);
        setEditInputIndexInvestors(-1);
        setEditInputValueInvestors('');
    };

    const fetchApis = useCallback(async () => {
        try {
            const urls = [
                `${FETCH_COUNTRIES_API}?per_page=300`,
                FETCH_CATEGORIES_API,
                FETCH_SOURCES_API,
                FETCH_AFFILIATIONS_API,
            ];
            const requests = urls.map(url =>
                asyncFetch(url).then(response => response.json())
            );
            const [
                rs_countries,
                rs_categories,
                rs_sources,
                rs_affiliations,
            ] = await Promise.all(requests);
            setCountries(rs_countries.countries);
            setCategories(rs_categories.categories);
            setSources(rs_sources.sources);
            setAffliations(rs_affiliations.affiliations);
        } catch (error) {
            notifyWithIcon('error', error.message);
        }
    }, []);


    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const changeImage = data => {
        setImageUrl(data);
    };

    const forMap = tag => (
        <span key={tag} style={{ display: 'inline-block' }}>
            <Tag closable onClose={() => handleClose(tag)}>
                {tag}
            </Tag>
        </span>
    );
    const tagChild = boardOfDirectors.map(forMap);

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
    const forMapAffiliation = tag => (
        <span key={tag} style={{ display: 'inline-block' }}>
            <Tag closable onClose={() => handleCloseAffiliation(tag)}>
                {tag}
            </Tag>
        </span>
    );
    const tagChildAffiliations = investors.map(forMapAffiliation);

    const handleChange = info => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }
        if (info.file.status === 'done') {
            // Get this url from response in real world.
            getBase64(info.file.originFileObj, url => {
                setLoading(false);
                setImageUrl(url);
            });
        }
    };

    const beforeUpload = file => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    useEffect(() => {
        if (!loaded) {
            fetchApis();
            setLoaded(true);
        }
    }, [fetchApis, loaded]);

    const onSubmit = async values => {
        try {
            const config = {
                method: 'POST',
                body: {
                    ...values,
                    category_id: values.category_id?.id || null,
                    source_id: values.source_id?.id || null,
                    affiliations: values.affiliations?.id || null,
                    picture: imageUrl || null,
                },
            };
            console.log(config.body);
            const rs = await request(CREATE_ORG_API, config);
            console.log(rs);
            notifyWithIcon('success', rs.message);
            navigate('/org/organisation');
        } catch (e) {
            return { [FORM_ERROR]: e.message || 'could not create employee' };
        }
    };

    return (
        <div className="container-fluid">
            <Breadcrumbs pageTitle="New Organisation" parentPage="Organisation" />
            <div className="row">
                <Form
                    initialValues={{}}
                    onSubmit={onSubmit}
                    validate={values => {
                        const errors = {};

                        // if (!values.pf_num) {
                        // 	errors.pf_num = 'enter pf number';
                        // }
                        // if (!values.first_name) {
                        // 	errors.first_name = 'enter first name';
                        // }
                        // if (!values.last_name) {
                        // 	errors.last_name = 'enter last name';
                        // }
                        // if (!values.dob) {
                        // 	errors.dob = 'enter date of birth';
                        // }
                        // if (!values.gender) {
                        // 	errors.gender = 'select gender';
                        // }
                        // if (!values.affiliation) {
                        // 	errors.affiliation = 'select affiliation';
                        // }
                        // if (!values.state_id) {
                        // 	errors.state_id = 'select state of origin';
                        // }
                        // if (!values.pf_num) {
                        // 	errors.pf_num = 'enter pfs number';
                        // }
                        // if (!values.lga) {
                        // 	errors.lga = 'select lga';
                        // }
                        // if (!values.rank_id) {
                        // 	errors.rank_id = 'select rank';
                        // }
                        // if (!values.directorate_id) {
                        // 	errors.directorate_id = 'select directorate';
                        // }
                        // if (!values.cadre_id) {
                        // 	errors.cadre_id = 'select cadre';
                        // }
                        // if (!values.date_of_employment) {
                        // 	errors.date_of_employment = 'enter date of employment';
                        // }

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
                                            <h5 className="card-title mb-0">Organisation Information</h5>
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
                                                    <label className="form-label" htmlFor="first_name">
                                                        Registration Number <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <Field id="first_name" name="first_name">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="first_name"
                                                                placeholder="Enter first name"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="first_name" />
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
                                              
                                            
                                                {/* <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="phone_number">
                                                        Phone
                                                    </label>
                                                    <Field id="phone_number" name="phone_number">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="phone_number"
                                                                placeholder="Enter phone number"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="phone" />
                                                </div> */}
                                                {/* <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="email">
                                                        Email
                                                    </label>
                                                    <Field id="email" name="email">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="email"
                                                                className={`form-control ${error(meta)}`}
                                                                id="email"
                                                                placeholder="Enter email address"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="email" />
                                                </div> */}
{/*                                               
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="dob">
                                                        Date Of Birth <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="dob" name="dob">
                                                        {({ input, meta }) => (
                                                            <Flatpickr
                                                                className={`form-control ${error(meta)}`}
                                                                options={{
                                                                    dateFormat: 'd M, Y',
                                                                    maxDate: new Date(),
                                                                }}
                                                                placeholder="Select date of birth"
                                                                value={dateOfBirth}
                                                                onChange={([date]) => {
                                                                    input.onChange(
                                                                        moment(date).format('YYYY-MM-DD')
                                                                    );
                                                                    setDateOfBirth(date);
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="dob" />
                                                </div> */}
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
                                                    <label
                                                        className="form-label"
                                                        htmlFor="countries_operational"
                                                    >
                                                        Country Operational
                                                    </label>
                                                    <Field id="countries_operational" name="countries_operational">
                                                        {({ input, meta }) => (
                                                            <input
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="countries_operational"
                                                                placeholder="Country Operational"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="countries_operational" />
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

                                                    <Field name="board_of_directors">
                                                        {({ input, meta }) => (
                                                            <div className={`form-control ${error(meta)}`}>
                                                                {tagChild}
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
                                                                        <i className="ri-add-line" />  Add
                                                                    </Tag>
                                                                )}
                                                                <input
                                                                    {...input}
                                                                    type="hidden"
                                                                    value={boardOfDirectors}
                                                                    onChange={() => { }}
                                                                    onBlur={() => input.onBlur(boardOfDirectors)}
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
                                                    <label className="form-label" htmlFor="affiliations">
                                                        Affiliations
                                                    </label>

                                                    <Select
                                                        isMulti
                                                        name="affiliations"
                                                        options={affiliations}
                                                        value={selectedAffiliations}
                                                        onChange={handleChangeAff}
                                                        className="basic-multi-select"
                                                        classNamePrefix="select"
                                                        placeholder="Select Affiliations"
                                                    />

                                                    {selectedAffiliations.map((affiliation) => (
                                                        <span key={affiliation.id} className="tag">
                                                            {affiliation.name}
                                                        </span>
                                                    ))}
                                                </div>

                                       
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="investors">
                                                        Investors
                                                    </label>

                                                    <Field name="investors">
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
                                                    <label className="form-label" htmlFor="category_id">
                                                        Category <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="category_id" name="category_id">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                {...input}
                                                                className={error(meta)}
                                                                placeholder="Select Category"
                                                                options={categories}
                                                                getOptionValue={option => option.id}
                                                                getOptionLabel={option => option.name}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="category_id" />
                                                </div>
                                                <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="source_id">
                                                        Source <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="source_id" name="source_id">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                {...input}
                                                                className={error(meta)}
                                                                placeholder="Select source"
                                                                options={sources}
                                                                getOptionValue={option => option.id}
                                                                getOptionLabel={option => option.name}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="source_id" />
                                                </div>
                                                {/* <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="country_id">
                                                        Country <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <Field id="country_id" name="country_id">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                {...input}
                                                                className={error(meta)}
                                                                placeholder="Select country"
                                                                options={countries}
                                                                value={country}
                                                                getOptionValue={option => option.id}
                                                                getOptionLabel={option => option.en_short_name}
                                                                onChange={e => {
                                                                    e ? input.onChange(e.id) : input.onChange('');
                                                                    setCountry(e);
                                                                    setStates([]);
                                                                    fetchStates(e.id);
                                                                    form.change('state_id', undefined);
                                                                }}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="country_id" />
                                                </div> */}
                                                {/* <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="state_id">
                                                        State <span style={{ color: 'red' }}>*</span>
                                                    </label>
                                                    <Field id="state_id" name="state_id">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                {...input}
                                                                className={error(meta)}
                                                                placeholder="Select state"
                                                                options={states}
                                                                getOptionValue={option => option.id}
                                                                getOptionLabel={option => option.name}
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="state_id" />
                                                </div> */}
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
                                                {/* <div className="col-lg-12 mb-3">
                                                    <label className="form-label" htmlFor="remark">
                                                        Remark
                                                    </label>
                                                    <Field id="remark" name="remark">
                                                        {({ input, meta }) => (
                                                            <textarea
                                                                {...input}
                                                                type="text"
                                                                className={`form-control ${error(meta)}`}
                                                                id="remark"
                                                                placeholder="Enter remark"
                                                            />
                                                        )}
                                                    </Field>
                                                    <ErrorBlock name="remark" />
                                                </div> */}
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
                                        <Link to="/org/organisation" className="btn btn-danger w-sm me-1">
                                            Cancel
                                        </Link>
                                        <button type="submit" className="btn btn-success w-sm">
                                            Create Organisation
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
                                                <UploadButton
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

export default NewOrganisation;