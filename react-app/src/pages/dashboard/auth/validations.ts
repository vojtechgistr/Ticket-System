import {Buffer} from 'buffer';
import {canSpecialCharactersBeInUsername} from "../../../common/config.ts";

export function validateUsername(value: string): { status: boolean, value: string } {
    if (!canSpecialCharactersBeInUsername) {
        // remove special chars if needed
        value = value.replace(/[^\w\s.-]/gi, '');

        // remove 3 dots/dashes/underscores in a row to prevent abuse
        value = value.replace(/(\.{3,})|(-{3,})|(_{3,})/g, '');
    }

    const minLength: number = 4;
    const maxLength: number = 32;
    const maxByteLength: number = 64;
    if (value.length < minLength
        || value.length > maxLength
        || Buffer.byteLength(value, "utf-8") > maxByteLength) {
        return {status: false, value: value.slice(0, maxLength)};
    }

    return {status: true, value: value};
}

export function validateTag(value: string): { status: boolean, value: string } {
    value = value.replace(/[^0-9]/g, '');
    if (value.length != 4) {
        return {status: false, value: value};
    }
    return {status: true, value: value};
}

export function validatePassword(value: string): { status: boolean, value: string } {
    const minLength: number = 8;
    const maxLength: number = 255;
    const maxByteLength: number = 255;
    if (value.length < minLength
        || value.length > maxLength
        || Buffer.byteLength(value, "utf-8") > maxByteLength) {
        return {status: false, value: value.slice(0, maxLength)};
    }

    return {status: true, value: value};
}

export function validateEmail(value: string): { status: boolean, value: string } {
    const minLength: number = 4;
    const maxLength: number = 255;
    const maxByteLength: number = 255;
    if (value.length < minLength
        || value.length > maxLength
        || Buffer.byteLength(value, "utf-8") > maxByteLength) {
        return {status: false, value: value.slice(0, maxLength)};
    }

    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
    return {status: regex.test(value), value: value};
}

// export const isInputValidShowErrors = (e, type) => {
//     let validateData;
//
//     switch (type) {
//         case "email":
//             validateData = isEmailValid(e.target.value);
//             break;
//         case "tag":
//             validateData = isTagValid(e.target.value);
//             break;
//
//         case "username":
//             validateData = isUsernameValid(e.target.value);
//             break;
//
//         case "password_match":
//             // get the password inputs
//             const password = document.querySelector("#user-new-password-settings");
//             const passwordConfirm = document.querySelector("#user-new-password-confirm-settings");
//
//             // check if the password is valid
//             validateData = doPasswordsMatch(password.value, passwordConfirm.value);
//
//             // add error class if passwords don't match
//             if (!validateData.status) {
//                 password.classList.add("error");
//                 passwordConfirm.classList.add("error");
//             } else {
//                 password.classList.remove("error");
//                 passwordConfirm.classList.remove("error");
//             }
//
//             // return the passwords
//             return validateData.value;
//
//         case "password":
//             validateData = isPasswordValid(e.target.value);
//             break;
//
//         default:
//             break;
//     }
//
//     // if email is valid and input has error class, remove error class
//     if ((validateData.status && e.target.classList.contains("error")) || e.target.value.length === 0) {
//         e.target.classList.remove("error");
//     } else if (!validateData.status && !e.target.classList.contains("error")) {
//         e.target.classList.add("error");
//     }
//
//     return validateData.value;
// };

export function doPasswordsMatch(pass1: string, pass2: string): boolean {
    return pass1 == pass2;
}

export function isFileValid(file: File): boolean {
    const maxSizeInMB: number = 8;
    if (!file
        || file.size > (maxSizeInMB * 1024 * 1024)) {
        return false;
    }

    const acceptedFormats: string[] = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"];
    return acceptedFormats.includes(file.type);
}