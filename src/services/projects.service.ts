import {apiUrl} from "../utils/constants";
import {GET} from "./api.service.wrapper";

const storageProjects = 'USER_PROJECTS';
let userProjects;

export const SetProjects = (projects) => {
    if (projects) {
        userProjects = projects;
        localStorage.setItem(storageProjects, JSON.stringify(projects));
    } else {
        localStorage.removeItem(storageProjects);
    }
}

export const GetUserProjects = () => {
    return userProjects || JSON.parse(localStorage.getItem(storageProjects)) || [];
}

export const ClearProjects = () => {
    userProjects = null;
    localStorage.removeItem(storageProjects);
}

export const GetProjects = async (developerUuid: string) => {
    const response = await GET(apiUrl.projects, { developerUuid });
    if (response?.status) {
        SetProjects(response.data);
    }
    return response;
}
