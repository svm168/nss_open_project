import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true

    const backendURL = import.meta.env.VITE_BACKEND_URL     // Syntax to write environment variables in frontend.
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userData, setUserData] = useState(false)
    const [causes, setCauses] = useState([])
    const [causesLoading, setCausesLoading] = useState(true)

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendURL + '/api/auth/is-auth')
            if(data.success){
                setIsLoggedIn(true)
                getUserData()
            }
        } catch (error) {
            // User is not logged in, which is expected. No need to show toast error.
            setIsLoggedIn(false)
        }
    }

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendURL}/api/user/data`)

            if (data.success) {
                setUserData(data.userData)
                return data.userData
            } else {
                toast.error(data.message)
                return null
            }
        } catch (error) {
            toast.error(error.message)
            return null
        }
    }

    const fetchCauses = async () => {
        try {
            setCausesLoading(true)
            const { data } = await axios.get(`${backendURL}/api/cause/all`)

            if (data.success) {
                setCauses(data.causes || [])
            } else {
                toast.error(data.message || 'Failed to load causes')
            }
        } catch (error) {
            console.error('Error fetching causes:', error)
            toast.error('Error loading causes')
        } finally {
            setCausesLoading(false)
        }
    }

    useEffect(() => {
        getAuthState()
        fetchCauses()
    }, [])

    const value = {
        backendURL,
        isLoggedIn, setIsLoggedIn,
        userData, setUserData,
        getUserData,
        causes, setCauses,
        fetchCauses,
        causesLoading,
    }

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}