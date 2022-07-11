import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

type UseCanPaarams = {
    permissions?: string[];
    roles?: string[];
}
export function useCan({ permissions = [], roles = [] }: UseCanPaarams) {
    const { user, isAuthenticated } = useContext(AuthContext)

    if (!isAuthenticated) {
        return false;
    }

    if (permissions.length > 0) {
        const hasAllpermissionss = permissions.every(permissions => {
            return user.permissions?.includes(permissions)
        });

        if (!hasAllpermissionss) {
            return false;
        }
    }
    if (roles.length > 0) {
        const hasAllroles = roles.some(roles => {
            return user.roles?.includes(roles)
        });

        if (!hasAllroles) {
            return false;
        }
    }
    return true;
}