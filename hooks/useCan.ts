import { useContext } from "react";
import { Authcontext } from "../contexts/Authcontext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type useCanParams = {
    permissions?: string[];
    roles?: string[];
}

export function useCan({ permissions, roles }: useCanParams) {

    const { user, isAuthenticated } = useContext(Authcontext)

    if (!isAuthenticated) {
        return false;
    }
    const userHasValidPermissions = validateUserPermissions({
         user, 
         permissions, 
         roles })

    return userHasValidPermissions;
}