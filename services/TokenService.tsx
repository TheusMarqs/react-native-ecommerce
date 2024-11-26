import { getCookie, saveCookie } from "./CookieService";
import axios from "axios";

export const getNewAccessToken = async () => {
    const refreshToken = getCookie('refresh_token');
    if (refreshToken !== null) {
        const response = await axios.post('https://backend-pm.onrender.com/token/refresh', {
            refresh: refreshToken,
        }, {
            validateStatus: () => true,
        });

        if (response.status === 200) {
            console.log('Token refreshed');
            const accessToken = response.data.access;
            saveCookie('access_token', accessToken);
            return accessToken;
        } else if (response.status === 401) {
            console.log('Invalid refresh token');
            return null;
        }
    } else {
        console.log('No refresh token available');
        return null;
    }
};