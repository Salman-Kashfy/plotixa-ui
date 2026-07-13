import {apiUrl, OTP_CHANNEL} from "../../utils/constants";
import {POST,GET} from "../api.service.wrapper";

interface CreateOtpInterface {
    identifier: string,
    type: string,
    channel: OTP_CHANNEL
}

interface CreateOtpInterface {
    identifier: string,
    type: string,
    channel: OTP_CHANNEL
}

interface InviteParams {
    password: string
    inviteLink: string
}

export const CreateOtp = async (data:CreateOtpInterface) => {
    return POST(apiUrl.createOtp, data);
}

export const VerifyOtp = async (data:CreateOtpInterface) => {
    return POST(apiUrl.verifyOtp, data);
}

export const ResetPassword = async (data:CreateOtpInterface) => {
    return POST(apiUrl.resetPassword, data);
}

export const ValidateInvite = async (inviteLink) => {
    return GET(apiUrl.validateInvite,{inviteLink});
}

export const Invite = async (data:InviteParams) => {
    return POST(apiUrl.invite, data);
}