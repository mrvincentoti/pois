import { BASE_AUDIT_URL, BASE_AUTH_URL, BASE_EMPLOYEE_URL } from './constants';

// authentication apis
export const LOGIN_API = `${BASE_AUTH_URL}/poi/user/login`;
export const USER_API = `${BASE_AUTH_URL}/poi/users/:id`;
export const LOGOUT_API = `${BASE_AUTH_URL}/poi/user/logout`;
export const SET_PASSWORD_API = `${BASE_AUTH_URL}/poi/user/set_password/:id`;

// modules api
export const FETCH_MODULES_API = `${BASE_AUTH_URL}/modules`;

// permissions api
export const FETCH_PERMISSIONS_API = `${BASE_AUTH_URL}/permissions`;
export const FETCH_ALL_PERMISSIONS_API = `${BASE_AUTH_URL}/all-permissions`;
export const CREATE_PERMISSION_API = `${BASE_AUTH_URL}/permissions`;
export const SET_ROLE_PERMISSIONS_API = `${BASE_AUTH_URL}/roles/:id/permissions`;

// roles api
export const FETCH_ROLE_API = `${BASE_AUTH_URL}/roles`;
export const CREATE_ROLE_API = `${BASE_AUTH_URL}/roles`;
export const DELETE_ROLE_API = `${BASE_AUTH_URL}/roles/:id`;

// users api
export const FETCH_USERS_API = `${BASE_AUTH_URL}/poi/users`;
export const CREATE_USER_API = `${BASE_AUTH_URL}/poi/users`;
export const DELETE_USER_API = `${BASE_AUTH_URL}/poi/users/:id`;
export const UPDATE_USER_API = `${BASE_AUTH_URL}/poi/users/:id`;
export const RESTORE_USER_API= `${BASE_AUTH_URL}/poi/user/restore/:id`;

// dashboard apis
export const FETCH_DASHBOARD_API = `${BASE_EMPLOYEE_URL}/dashboard`;

// employee apis
export const FETCH_EMPLOYEES_API = `${BASE_EMPLOYEE_URL}/employees`;
export const FILTER_EMPLOYEES_API = `${BASE_EMPLOYEE_URL}/employees`;
export const CREATE_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employees`;
export const GET_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employees/:id`;
export const UPDATE_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employees/:id`;
export const DELETE_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employees/:id`;
export const BULK_UPLOAD_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-bulk-upload`;

// directorates api
export const FETCH_DIRECTORATES_API = `${BASE_EMPLOYEE_URL}/directorates`;
export const CREATE_DIRECTORATE_API = `${BASE_EMPLOYEE_URL}/directorates`;
export const DELETE_DIRECTORATES_API = `${BASE_EMPLOYEE_URL}/directorate/:id`;
export const UPDATE_DIRECTORATES_API = `${BASE_EMPLOYEE_URL}/directorate/:id`;

// departments api
export const FETCH_DEPARTMENTS_API = `${BASE_EMPLOYEE_URL}/departments`;
export const CREATE_DEPARTMENTS_API = `${BASE_EMPLOYEE_URL}/departments`;
export const DELETE_DEPARTMENTS_API = `${BASE_EMPLOYEE_URL}/department/:id`;
export const UPDATE_DEPARTMENTS_API = `${BASE_EMPLOYEE_URL}/department/:id`;

// units api
export const FETCH_UNITS_API = `${BASE_EMPLOYEE_URL}/units`;
export const CREATE_UNIT_API = `${BASE_EMPLOYEE_URL}/units`;
export const UPDATE_UNIT_API = `${BASE_EMPLOYEE_URL}/units/:id`;
export const DELETE_UNIT_API = `${BASE_EMPLOYEE_URL}/units/:id`;

// cadre api
export const FETCH_CADRES_API = `${BASE_EMPLOYEE_URL}/cadres`;
export const CREATE_CADRE_API = `${BASE_EMPLOYEE_URL}/cadres`;
export const DELETE_CADRE_API = `${BASE_EMPLOYEE_URL}/cadre/:id`;
export const UPDATE_CADRE_API = `${BASE_EMPLOYEE_URL}/cadre/:id`;

// ranks api
export const FETCH_RANKS_API = `${BASE_EMPLOYEE_URL}/ranks`;
export const FETCH_ALL_RANKS_API = `${BASE_EMPLOYEE_URL}/all-ranks`;
export const CREATE_RANK_API = `${BASE_EMPLOYEE_URL}/ranks`;
export const UPDATE_RANK_API = `${BASE_EMPLOYEE_URL}/rank/:id`;
export const DELETE_RANK_API = `${BASE_EMPLOYEE_URL}/rank/:id`;
export const IMPORT_RANKS_API = `${BASE_EMPLOYEE_URL}/import-ranks`;

// designations api
export const FETCH_DESIGNATIONS_API = `${BASE_EMPLOYEE_URL}/designations`;
export const FETCH_ALL_DESIGNATIONS_API = `${BASE_EMPLOYEE_URL}/all-designations`;
export const CREATE_DESIGNATION_API = `${BASE_EMPLOYEE_URL}/designations`;
export const UPDATE_DESIGNATION_API = `${BASE_EMPLOYEE_URL}/designation/:id`;
export const DELETE_DESIGNATION_API = `${BASE_EMPLOYEE_URL}/designation/:id`;

// specialty api
export const FETCH_SPECIALTIES_API = `${BASE_EMPLOYEE_URL}/specialties`;
export const FETCH_ALL_SPECIALTIES_API = `${BASE_EMPLOYEE_URL}/all-specialties`;
export const CREATE_SPECIALTY_API = `${BASE_EMPLOYEE_URL}/specialties`;
export const UPDATE_SPECIALTY_API = `${BASE_EMPLOYEE_URL}/specialty/:id`;
export const DELETE_SPECIALTY_API = `${BASE_EMPLOYEE_URL}/specialty/:id`;

// awards api
export const FETCH_AWARDS_API = `${BASE_EMPLOYEE_URL}/awards`;
export const CREATE_AWARD_API = `${BASE_EMPLOYEE_URL}/awards`;
export const UPDATE_AWARD_API = `${BASE_EMPLOYEE_URL}/awards/:id`;
export const DELETE_AWARD_API = `${BASE_EMPLOYEE_URL}/awards/:id`;

export const FETCH_EMPLOYEE_AWARDS_API = `${BASE_EMPLOYEE_URL}/employee-awards`;
export const CREATE_EMPLOYEE_AWARD_API = `${BASE_EMPLOYEE_URL}/employee-awards`;
export const UPDATE_EMPLOYEE_AWARD_API = `${BASE_EMPLOYEE_URL}/employee-award/:id`;
export const DELETE_EMPLOYEE_AWARD_API = `${BASE_EMPLOYEE_URL}/employee-award/:id`;
export const BULK_UPLOAD_AWARDS_API = `${BASE_EMPLOYEE_URL}/award-bulk-upload`;
export const FETCH_EMPLOYEE_AWARD_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-award/:id`;

// trainings api
export const FETCH_TRAININGS_API = `${BASE_EMPLOYEE_URL}/trainings`;
export const CREATE_TRAINING_API = `${BASE_EMPLOYEE_URL}/trainings`;
export const UPDATE_TRAINING_API = `${BASE_EMPLOYEE_URL}/training/:id`;
export const DELETE_TRAINING_API = `${BASE_EMPLOYEE_URL}/training/:id`;

export const FETCH_EMPLOYEE_TRAININGS_API = `${BASE_EMPLOYEE_URL}/employee-trainings`;
export const CREATE_EMPLOYEE_TRAINING_API = `${BASE_EMPLOYEE_URL}/employee-trainings`;
export const UPDATE_EMPLOYEE_TRAINING_API = `${BASE_EMPLOYEE_URL}/employee-training/:employee_training_id`;
export const DELETE_EMPLOYEE_TRAINING_API = `${BASE_EMPLOYEE_URL}/employee-training/:employee_training_id`;
export const FETCH_EMPLOYEE_TRAINING_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-trainings/employee/:id`;

export const BULK_UPLOAD_TRAININGS_API = `${BASE_EMPLOYEE_URL}/training-bulk-upload`;

// sanctions api
export const FETCH_SANCTIONS_API = `${BASE_EMPLOYEE_URL}/sanctions`;
export const CREATE_SANCTION_API = `${BASE_EMPLOYEE_URL}/sanctions`;
export const UPDATE_SANCTION_API = `${BASE_EMPLOYEE_URL}/sanction/:id`;
export const DELETE_SANCTION_API = `${BASE_EMPLOYEE_URL}/sanction/:id`;

export const FETCH_EMPLOYEE_SANCTIONS_API = `${BASE_EMPLOYEE_URL}/employee-sanctions`;
export const CREATE_EMPLOYEE_SANCTION_API = `${BASE_EMPLOYEE_URL}/employee-sanctions`;
export const UPDATE_EMPLOYEE_SANCTION_API = `${BASE_EMPLOYEE_URL}/employee-sanction/:id`;
export const DELETE_EMPLOYEE_SANCTION_API = `${BASE_EMPLOYEE_URL}/employee-sanction/:id`;

export const BULK_UPLOAD_SANCTIONS_API = `${BASE_EMPLOYEE_URL}/sanction-bulk-upload`;

export const FETCH_EMPLOYEE_SANCTIONS_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-sanction/:id`;

// conference api
export const FETCH_CONFERENCES_API = `${BASE_EMPLOYEE_URL}/conferences`;
export const CREATE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/conferences`;
export const UPDATE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/conferences/:id`;
export const DELETE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/conferences/:id`;

export const FETCH_EMPLOYEE_CONFERENCES_API = `${BASE_EMPLOYEE_URL}/employee-conference`;
export const CREATE_EMPLOYEE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/employee-conference`;
export const UPDATE_EMPLOYEE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/employee-conference/:id`;
export const DELETE_EMPLOYEE_CONFERENCE_API = `${BASE_EMPLOYEE_URL}/employee-conference/:id`;
export const FETCH_EMPLOYEE_CONFERENCE_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-conference/:id`;

export const BULK_UPLOAD_CONFERENCES_API = `${BASE_EMPLOYEE_URL}/conference-bulk-upload`;

// postings api
export const FETCH_EMPLOYEE_POSTINGS_API = `${BASE_EMPLOYEE_URL}/employee-postings`;
export const FETCH_EMPLOYEE_POSTINGS_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-postings/employee/:id`;
export const CREATE_EMPLOYEE_POSTINGS_API = `${BASE_EMPLOYEE_URL}/employee-postings`;
export const DELETE_EMPLOYEE_POSTINGS_API = `${BASE_EMPLOYEE_URL}/employee-postings/:id`;
export const UPDATE_EMPLOYEE_POSTINGS_API = `${BASE_EMPLOYEE_URL}/employee-postings/:id`;
export const FILTER_EMPLOYEE_POSTINGS_API = `${BASE_EMPLOYEE_URL}/employee-posting/filter`;

export const UPDATE_EMPLOYEE_POSTINGS_ACTION_API = `${BASE_EMPLOYEE_URL}/employee-posting/action/:id`;

export const BULK_UPLOAD_POSTINGS_API = `${BASE_EMPLOYEE_URL}/posting-bulk-upload`;

// employee due for returning from postings api
export const FETCH_EMPLOYEE_DUE_FOR_RETURN_POSTINGS_API = `${BASE_EMPLOYEE_URL}/returning-from-posting-in-four-months`;

// employee retiring in four months api
export const FETCH_EMPLOYEE_RETIRING_SOON_API = `${BASE_EMPLOYEE_URL}/retiring-in-four-months`;

//employee deployments
export const FETCH_EMPLOYEE_DEPLOYMENT_API = `${BASE_EMPLOYEE_URL}/employee-deployments`;
export const CREATE_EMPLOYEE_DEPLOYMENTS_API = `${BASE_EMPLOYEE_URL}/employee-deployments`;
export const UPDATE_EMPLOYEE_DEPLOYMENTS_API = `${BASE_EMPLOYEE_URL}/employee-deployment/:id`;
export const DELETE_EMPLOYEE_DEPLOYMENTS_API = `${BASE_EMPLOYEE_URL}/employee-deployment/:id`;
export const BULK_UPLOAD_DEPLOYMENTS_API = `${BASE_EMPLOYEE_URL}/deployment-bulk-upload`;
export const FETCH_EMPLOYEE_DEPLOYMENT_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/employee-deployment/:id`;

//employee dependents
export const FETCH_EMPLOYEE_DEPENDENTS_API = `${BASE_EMPLOYEE_URL}/dependents`;
export const CREATE_EMPLOYEE_DEPENDENTS_API = `${BASE_EMPLOYEE_URL}/dependents`;
export const UPDATE_EMPLOYEE_DEPENDENTS_API = `${BASE_EMPLOYEE_URL}/dependent/:employee_dependent_id`;
export const BULK_UPLOAD_DEPENDANT_API = `${BASE_EMPLOYEE_URL}/dependent-bulk-upload`;
export const FETCH_EMPLOYEES_DEPENDANTS_API = `${BASE_EMPLOYEE_URL}/dependents/:id`;

//employee next of kin
export const FETCH_EMPLOYEE_NEXT_OF_KIN_API = `${BASE_EMPLOYEE_URL}/nok`;
export const CREATE_EMPLOYEE_NEXT_OF_KIN_API = `${BASE_EMPLOYEE_URL}/nok/:id`;
export const UPDATE_EMPLOYEE_NEXT_OF_KIN_API = `${BASE_EMPLOYEE_URL}/nok/:id`;
export const BULK_UPLOAD_NOK_API = `${BASE_EMPLOYEE_URL}/nok-bulk-upload`;
export const FETCH_EMPLOYEE_NEXT_OF_KIN_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/nok/:id`;

// promotions api
export const FETCH_EMPLOYEE_PROMOTIONS_API = `${BASE_EMPLOYEE_URL}/promotions`;
export const BULK_UPLOAD_PROMOTIONS_API = `${BASE_EMPLOYEE_URL}/promotion-bulk-upload`;
export const FETCH_EMPLOYEE_PROMOTIONS_BY_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/promotions/employee/:id`;

// Due for promotions api
export const FETCH_EMPLOYEE_DUE_FOR_PROMOTIONS_API = `${BASE_EMPLOYEE_URL}/promotions/due`;

// region api
export const FETCH_REGIONS_API = `${BASE_EMPLOYEE_URL}/regions`;

// station api
export const FETCH_STATIONS_API = `${BASE_EMPLOYEE_URL}/stations`;
export const FETCH_STATIONS_BY_REGION_API = `${BASE_EMPLOYEE_URL}/stations?:region_id`;

// gender api
export const FETCH_GENDERS_API = `${BASE_EMPLOYEE_URL}/genders`;

// state api
export const FETCH_STATES_API = `${BASE_EMPLOYEE_URL}/states`;

// lga api
export const FETCH_LGAS_BY_STATE_API = `${BASE_EMPLOYEE_URL}/lgas/:state_id`;
export const FETCH_RANKS_BY_CADRE_API = `${BASE_EMPLOYEE_URL}/ranks/cadre/:cadre_id`;

// religions api
export const FETCH_RELIGIONS_API = `${BASE_EMPLOYEE_URL}/religions`;

//implication api
export const FETCH_IMPLICATIONS_API = `${BASE_EMPLOYEE_URL}/implications`;

//promotions brief
export const UPLOAD_PROMOTION_BRIEFS_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/briefs`;
export const FETCH_PROMOTION_BRIEFS_EMPLOYEE_API = `${BASE_EMPLOYEE_URL}/briefs`;
export const FETCH_SINGLE_BRIEF_API = `${BASE_EMPLOYEE_URL}/brief/:id`;
export const UPDATE_SINGLE_BRIEF_API = `${BASE_EMPLOYEE_URL}/brief/:id`;
export const APPROVE_SINGLE_BRIEF_API = `${BASE_EMPLOYEE_URL}/brief/:id/1`;
export const DECLINE_SINGLE_BRIEF_API = `${BASE_EMPLOYEE_URL}/brief/:id/2`;
export const DELETE_SINGLE_BRIEF_API = `${BASE_EMPLOYEE_URL}/brief/:id`;

//Audit api
export const FETCH_AUDITS_API = `${BASE_AUDIT_URL}/audits`;
export const CHECK_API = `${BASE_EMPLOYEE_URL}/check`;