import {ROLE} from "./constants";
import {GetUserPermissions, GetUserRole, GetAuthUser} from "../services/auth/auth.service";
import {first} from "lodash";

export function hasPermission(permission):boolean {
    const permissions = GetUserPermissions()
    return permissions.includes('*') || permissions.includes(permission)
}

export function hasRole(role:ROLE):boolean {
    return GetUserRole() === role
}

export function getAuthGym():string {
    const { gyms } = GetAuthUser()
    return first(gyms)
}

export function getAuthBrand():string {
    const { brands } = GetAuthUser()
    return first(brands)
}