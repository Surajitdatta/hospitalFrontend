import { useState, useEffect } from "react";

const useApi = (endpoint ="", method = "GET")=>{
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([])


    const baseUrl = "https://hospitalbackend-eight.vercel.app"
    useEffect(()=>{
        const apiFun = async() =>{
           try{
            const url = baseUrl + endpoint
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json",
                }
            }
            const res = await fetch(url, options)
            if(!res.ok) {
                throw new Error("Something went wrong !")
            }
            const json = await res.json()
            setData(json)

           }catch(error){
            setError(err.message)

           }finally {
            setLoading(false)
           }

        }
        apiFun()
        if(endpoint){
            apiFun()
        }
    },[endpoint, method])

    return {
        data,
        loading,
        error
    }
}


export default useApi;




// app.use("/api/admin", adminRoute);
// app.use("/api/appoinment", appoinmentRoute);
// app.use("/api/contact", contactRoute);
// app.use("/api/department", departmentRoute);
// app.use("/api/doctor", doctorRoute);
// app.use("/api/jobs", jobRoute);
// app.use("/api/news-events", newsEventRoute);
// app.use("/api/reviews", reviewRoute);
// app.use("/api/users", userRoute);
// app.use("/api/terms", termsRoute)

// https://hospitalbackend-eight.vercel.app/