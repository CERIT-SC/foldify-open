import {useState} from "react";
import axios from "axios";

export const useJobData = (jobName: string) => {
    const [loadingPlddt, setLoadingPlddt] = useState<boolean>(true);

    const fetchData = async (endpoint: string, setter: (data: any) => void) => {

        try {
            const response = await axios.get(`/api/flask/result/${jobName}${endpoint}`);
            setter(response.data);
            if (endpoint === "/plddt") setLoadingPlddt(false);
        } catch (error: any) {
            if (endpoint === "/plddt") setLoadingPlddt(false);
            if (error.response) {
                const errorMessage = error.response.data.error || JSON.stringify(error.response.data);
                console.log(errorMessage);
            } else if (error.request) {
                console.log("No response received from the server.");
            } else {
                console.log(`An error occurred: ${error.message}`);
            }
        }
    };

    return {fetchData, loadingPlddt};
};
