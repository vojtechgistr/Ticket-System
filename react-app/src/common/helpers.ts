export const handleNavigationClick = (url: string, target: "_blank" | "_self"): void => {
    window.open(url, target)
}

export const areValuesEqual = (obj1: any, obj2: any) => {

    if (!obj1 && !obj2) {
        return true;
    }

    if (!obj1 || !obj2) {
        return false;
    }

    const props1 = Object.keys(obj1);
    const props2 = Object.keys(obj2);

    if (props1.length != props2.length) {
        return false;
    }

    for (let i = 0; i < props1.length; i++) {
        const val1 = obj1[props1[i]];
        const val2 = obj2[props1[i]];
        const areObjects = typeof val1 === "object" && typeof val2 === "object";
        if ((areObjects && !areValuesEqual(val1, val2)) || (!areObjects && val1 !== val2)) {
            return false;
        }
    }

    return true;
}

export const getHighestRole = (roles: string[]): string => {
    const validRoles = ["Owner", "Admin", "Moderator", "User"];
    let highestRole: string = "";
    validRoles.some(validRole => {
        if (roles.includes(validRole)) {
            highestRole = validRole;
            return true;
        }
    });

    return highestRole;
}

export const getLowerRoles = (roles: string[]): string[] => {
    const validRoles = ["Owner", "Admin", "Moderator", "User"];
    const highestRole: string = getHighestRole(roles);
    const indexOfHighestRole: number = validRoles.indexOf(highestRole);
    return validRoles.slice(indexOfHighestRole);
}
