import axios from 'axios';
import * as url from './config';
import { getToken } from '@/utils/auth';

const api=axios.create({
    baseURL:url.BASE_URL,
    headers:{
        'Content-Type':'application/json',
    },
});

api.interceptors.request.use(
    async(config)=>{
        const token=getToken();
        if(token){
            config.headers.Authorization=token;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response)=>{
        return response.data;
    },
    (error)=>{
        return Promise.reject(error);
    }
);

// User authentication APIs
export async function loginApi(email, password) {
    try {
        const response = await api.post(url.LOGIN_URL, { email, password });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function logoutApi() {
    try {
        const response = await api.post(url.LOGOUT_URL);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function registerApi(userData) {
    try {
        const response = await api.post(url.CREATE_USER_URL, userData);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getUserByIdApi(userId) {
    try {
        const response = await api.get(`${url.GET_USER_BY_ID_URL}/${userId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

// Event management APIs
export async function createEventApi(eventData) {
    try {
        const response = await api.post(url.CREATE_EVENT_URL, eventData);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getEventApi(eventId) {
    try {
        const response = await api.get(`${url.GET_EVENT_URL}/${eventId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function updateEventApi(eventId, eventData) {
    try {
        const response = await api.patch(`${url.UPDATE_EVENT_URL}/${eventId}`, eventData);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function deleteEventApi(eventId) {
    try {
        const response = await api.delete(`${url.DELETE_EVENT_URL}/${eventId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function registerEventApi(eventId) {
    try {
        const response = await api.post(`${url.REGISTER_EVENT_URL}/${eventId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function searchEventApi(params = {}) {
    try {
        const response = await api.get(url.SEARCH_EVENT_URL, { params });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function countEventApi(params = {}) {
    try {
        const response = await api.get(url.COUNT_EVENT_URL, { params });
        return response;
    } catch (error) {
        throw error;
    }
}

// Question management APIs
export async function createQuestionApi(eventId, questionData) {
    try {
        const response = await api.post(`${url.CREATE_QUESTION_URL}/${eventId}/question`, questionData);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function deleteQuestionApi(questionId) {
    try {
        const response = await api.delete(`${url.DELETE_QUESTION_URL}/${questionId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function upvoteQuestionApi(questionId) {
    try {
        const response = await api.post(`${url.VOTE_QUESTION_URL}/${questionId}/vote`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function downvoteQuestionApi(questionId) {
    try {
        const response = await api.delete(`${url.VOTE_QUESTION_URL}/${questionId}/vote`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getUserQuestionsApi() {
    try {
        const response = await api.get(url.GET_USER_QUESTIONS_URL);
        return response;
    } catch (error) {
        throw error;
    }
}