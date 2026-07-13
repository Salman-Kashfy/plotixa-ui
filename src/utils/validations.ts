export function decimalOnly(e) {
    let value = e.target.value;

    // Allow only numbers and a single decimal point
    value = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimals
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1) {
        value =
            value.substring(0, decimalIndex + 1) +
            value.substring(decimalIndex + 1).replace(/\./g, '');
    }

    // Restrict to 6 digits before the decimal and 2 after
    const parts = value.split('.');
    if (parts[0].length > 6) {
        parts[0] = parts[0].slice(0, 6);
    }
    if (parts[1]?.length > 2) {
        parts[1] = parts[1].slice(0, 2);
    }

    e.target.value = parts.join('.');
}

export function upperAlphaOnly(e,limit = null) {
    let value = e.target.value;
    value = value.replace(/[^a-zA-Z]/g, '');
    if (limit && value.length > limit) {
        value = value.slice(0, limit);
    }
    e.target.value = value.toUpperCase();
}

export const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}

export const numberOnly = (e, max = null, leadingZero = true) => {
    let value = e.target.value.replace(/[^0-9]/g, '')
    if (max && value.length > max) {
        value = value.slice(0, 2);
    }
    if(!leadingZero){
        value = value.replace(/^0+/, '');
    }
    e.target.value = value
}

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPassword = (password:string): boolean => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    return regex.test(password);
}