import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Breadcrumbs from '../../components/Breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import FormWrapper from '../../container/FormWrapper';
import { ErrorBlock, FormSubmitError, error } from '../../components/FormBlock';
import { asyncFetch, notifyWithIcon, request, createHeaders } from '../../services/utilities';
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
//import Select from 'react-select';
import { Select  } from "antd";
import UploadFilePicture from '../../components/UploadFile';


const NewOrganisation = () => {
    const [loaded, setLoaded] = useState(false);
    const [dateOfRegistration, setDateOfRegistration] = useState(null);
    const [categories, setCategories] = useState([]);
    const [sources, setSources] = useState([]);
    const [countries, setCountries] = useState([]);
    const [country, setCountry] = useState([]);
    const [imageUrl, setImageUrl] = useState();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [boardOfDirectors, setBoardOfDirectors] = useState([]);
    const [investors, setInvestors] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    // Investors
    const [inputValueInvestors, setInputValueInvestors] = useState('');
    const [inputVisibleInvestors, setInputVisibleInvestors] = useState(false);

    // Affiliation
    const [affiliations, setAffliations] = useState([]);
    const [affiliation, setAffliation] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [selectedAffiliations, setSelectedAffiliations] = useState([]);

    const handleCloseAffiliation = removedTag => {
        const newTags = affiliations.filter(tag => tag !== removedTag);
        setAffliations(newTags);
    };

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


    const props = {
        maxCount: 1,
        onRemove: file => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            setFileList(newFileList);
        },

        fileList,
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

            const formattedCountries = rs_countries.countries.map(country => ({
                value: country.id, // Set the value (ID of the country)
                label: country.en_short_name, // Set the label (Name of the country)
            }));

            const formattedAffiliations = rs_affiliations.affiliations.map(affiliation => ({
                value: affiliation.id, // Set the value (ID of the country)
                label: affiliation.name, // Set the label (Name of the country)
            }));

            setCountries(formattedCountries);
            setCategories(rs_categories.categories);
            setSources(rs_sources.sources);
            setAffliations(formattedAffiliations);
        } catch (error) {
            notifyWithIcon('error', error.message);
        }
    }, []);

    const handleAffiliationChange = (value) => {
        console.log(value);
        setAffliation(value);
        setSelectedAffiliations(value);
    };


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




    const handleChange2 = (value) => {
        console.log(`selected ${value}`);
        setCountry(value);
    };
    

    useEffect(() => {
        if (!loaded) {
            fetchApis();
            setLoaded(true);
        }
    }, [fetchApis, loaded]);

    const onSubmit = async values => {
        try {
            const formData = new FormData();
            // for (const key in values) {
            //     if (key === 'affiliations' || key === 'countries_operational') {
            //         formData.append(key, values[key].map(item => item.id).join(", "));
            //     } else if (key === 'board_of_directors' || key === 'investors') {
            //         formData.append(key, values[key].join(", "));
            //     } else {
            //         formData.append(key, values[key]);
            //     }
            // }
            // Append your values to FormData
            for (const key in values) {
                formData.append(key, values[key]);
            }

            const appendIfExists = (key, value) => {
                if (value !== undefined && value !== null ) {
                    formData.append(key, value);
                }
            };
            //console.log(affiliations); return;
            appendIfExists('category_id', values.category);
            appendIfExists('source_id', values.source);
            appendIfExists('gender_id', values.gender?.id);
            appendIfExists('state_id', values.state?.id);
            appendIfExists('marital_status', values.marital_status?.name);
            appendIfExists('picture', imageUrl?.file);
            appendIfExists('board_of_directors', boardOfDirectors?.join(", "));
            appendIfExists('investors', investors?.join(", "));
            appendIfExists('affiliations', affiliation?.join(", "));
            appendIfExists('countries_operational', country?.join(", "));
            

            // for (let pair of formData.entries()) {
            // 	console.log(`${pair[0]}: ${pair[1]}`);
            // }

            // return

            const uri = CREATE_ORG_API;

            const headers = createHeaders(true);
            const response = await fetch(uri, {
                method: 'POST',
                body: formData,
                headers: headers,
            });

            const data = await response.json();

            if (data.error) {
                let errorMessage = data.error;

                notifyWithIcon('error', errorMessage);
            } else {
                notifyWithIcon('success', 'Organisation created successfully');
                navigate('/org/organisation');
            }
        } catch (e) {
            return { [FORM_ERROR]: e.message || 'could not create Organisation' };
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
                                                                placeholder="Please Country"
                                                                onChange={handleChange2}
                                                                options={countries}
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
                                            
                                                {/* <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="affiliations">
                                                        Affiliation <span style={{ color: 'red' }}></span>
                                                    </label>

                                                    <Field id="affiliations" name="affiliations">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                {...input}
                                                                isMulti
                                                                className={error(meta)}
                                                                placeholder="Select Affiliation"
                                                                options={affiliations}
                                                                getOptionValue={option => option.id}
                                                                getOptionLabel={option => option.name}
                                                                onChange={(value) => input.onChange(value)}
                                                                onBlur={() => input.onBlur(input.value)}

                                                                styles={{
                                                                    control: (provided) => ({
                                                                        ...provided,
                                                                        backgroundColor: '#fff',
                                                                        borderColor: '#ced4da',
                                                                        '&:hover': {
                                                                            borderColor: '#a3a3a3'
                                                                        }
                                                                    }),
                                                                    option: (provided, state) => ({
                                                                        ...provided,
                                                                        backgroundColor: state.isSelected ? '#f8f9fa' : '#fff', // Selected option background
                                                                        color: state.isSelected ? '#000' : '#000', // Selected option text color
                                                                        '&:hover': {
                                                                            backgroundColor: '#fafafa', // Hover background color
                                                                            color: '#000' // Hover text color
                                                                        }
                                                                    }),
                                                                    multiValue: (provided) => ({
                                                                        ...provided,
                                                                        backgroundColor: '#fafafa', // Background of selected tag
                                                                        color: '#000' // Text color of selected tag
                                                                    }),
                                                                    multiValueLabel: (provided) => ({
                                                                        ...provided,
                                                                        color: '#000' // Text color inside the selected tag
                                                                    }),
                                                                    multiValueRemove: (provided) => ({
                                                                        ...provided,
                                                                        color: '#fff', // Remove icon color
                                                                        '&:hover': {
                                                                            backgroundColor: '#fafafa', // Background color when hovering remove icon
                                                                            color: '#000'
                                                                        }
                                                                    })
                                                                }}
                                                            />
                                                        )}
                                                    </Field>

                                                    <ErrorBlock name="affiliations" />
                                                </div> */}
                                                <div className="col-lg-4 mb-3">
                                                    <label className="form-label" htmlFor="affiliation">
                                                        Affiliation <span style={{ color: 'red' }}></span>
                                                    </label>

                                                    <Field id="affiliation" name="affiliation">
                                                        {({ input, meta }) => (
                                                            <Select
                                                                mode="multiple"
                                                                allowClear
                                                                style={{
                                                                    width: '100%',
                                                                    height: '40px',
                                                                    borderColor: '#ced4da',
                                                                }}
                                                                placeholder="Please Affiliation"
                                                                onChange={handleAffiliationChange}
                                                                options={affiliations}
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

                                                {/* <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="category">
                                                        Category <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="category" name="category">
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
                                                    <ErrorBlock name="category" />
                                                </div> */}
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

                                                {/* <div className="col-lg-6 mb-3">
                                                    <label className="form-label" htmlFor="source">
                                                        Source <span style={{ color: 'red' }}></span>
                                                    </label>
                                                    <Field id="source" name="source">
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
                                                    <ErrorBlock name="source" />
                                                </div>      */}
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
                                                                placeholder="Select Source"
                                                                onChange={(value) => input.onChange(value)}  // Handle change event
                                                                options={sources.map(source => ({
                                                                    value: source.id,  // Map id to value
                                                                    label: source.name,  // Map name to label
                                                                }))}
                                                                className="custom-source-select"  // Custom class for styling
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
                                                <UploadFilePicture
                                                    {...props}
                                                    imageUrl={imageUrl}
                                                    changeImage={data => changeImage(data)}
                                                    style={{ width: '200px', height: '200px' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </FormWrapper>
                    )}
                />
            </div>
        </div>
    );
};

export default NewOrganisation;
