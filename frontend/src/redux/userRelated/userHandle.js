import { api } from '../../api/client';
import {
    authRequest,
    stuffAdded,
    authSuccess,
    authFailed,
    authError,
    authLogout,
    doneSuccess,
    getDeleteSuccess,
    getRequest,
    getFailed,
    getError,
} from './userSlice';

// Mock data for Guest Demo to ensure it always works
const mockUsers = {
    "Admin": {
        _id: "mock_admin_123",
        name: "Yogendra Singh",
        email: "yogendra@12",
        role: "Admin",
        schoolName: "BIT Mesra",
        branch: "Computer Science",
        school: { _id: "school_123", schoolName: "BIT Mesra" }
    },
    "Student": {
        _id: "mock_student_123",
        name: "Dipesh Awasthi",
        rollNum: "1",
        role: "Student",
        schoolName: "BIT Mesra",
        school: { _id: "school_123", schoolName: "BIT Mesra" },
        sclassName: { _id: "class_123", sclassName: "CSE-A" },
        attendance: []
    },
    "Teacher": {
        _id: "mock_teacher_123",
        name: "Tony Stark",
        email: "tony@12",
        role: "Teacher",
        schoolName: "BIT Mesra",
        school: { _id: "school_123", schoolName: "BIT Mesra" },
        teachSclass: { _id: "class_123", sclassName: "CSE-A" },
        teachSubject: { _id: "sub_123", subName: "Data Structures" }
    }
};

export const loginUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    const guestEnabled = import.meta.env.VITE_ENABLE_GUEST_DEMO === "true";

    // Guest Demo (opt-in via env)
    if (guestEnabled && fields.password === "zxc") {
        setTimeout(() => {
            const mockUser = mockUsers[role];
            if (mockUser) {
                dispatch(authSuccess(mockUser));
            } else {
                dispatch(authFailed("Guest user not configured"));
            }
        }, 1000);
        return;
    }

    try {
        const result = await api.post(`/${role}Login`, fields);
        if (result.data.role) {
            dispatch(authSuccess(result.data));
        } else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const registerUser = (fields, role) => async (dispatch) => {
    dispatch(authRequest());

    try {
        const result = await api.post(`/${role}Reg`, fields);
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else if (result.data.school) {
            dispatch(stuffAdded());
        }
        else {
            dispatch(authFailed(result.data.message));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};

export const logoutUser = () => (dispatch) => {
    dispatch(authLogout());
};

export const getUserDetails = (id, address) => async (dispatch) => {
    if (id.startsWith("mock_")) {
        // Return mock details if it's a mock user
        const mockUser = Object.values(mockUsers).find(u => u._id === id);
        dispatch(doneSuccess(mockUser || {}));
        return;
    }

    dispatch(getRequest());
    try {
        const result = await api.get(`/${address}/${id}`);
        if (result.data) {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const deleteUser = (id, address) => async (dispatch) => {
     dispatch(getRequest());
     try {
         const result = await api.delete(`/${address}/${id}`);
         if (result.data.message) {
             dispatch(getFailed(result.data.message));
         } else {
             dispatch(getDeleteSuccess());
         }
     } catch (error) {
         dispatch(getError(error));
     }
}

export const updateUser = (fields, id, address) => async (dispatch) => {
    dispatch(getRequest());
    try {
        const result = await api.put(`/${address}/${id}`, fields);
        if (result.data.schoolName) {
            dispatch(authSuccess(result.data));
        }
        else {
            dispatch(doneSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const addStuff = (fields, address) => async (dispatch) => {
    dispatch(authRequest());
    try {
        const result = await api.post(`/${address}Create`, fields);
        if (result.data.message) {
            dispatch(authFailed(result.data.message));
        } else {
            dispatch(stuffAdded(result.data));
        }
    } catch (error) {
        dispatch(authError(error));
    }
};