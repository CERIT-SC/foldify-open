import axios from "axios";
import { useState } from "react";

export function useRunningJobs() {
    const [runningJobs, setRunningJobs] = useState<any[]>([]);
    const [loadingRunningJobs, setLoadingRunningJobs] = useState<boolean>(false);

    const loadRunningJobs = (token: string) => {
        setLoadingRunningJobs(true);
        axios
            .get(`/api/flask/dashboard/running_jobs`)
            .then((response) => response.data)
            .then((data) => {
                setRunningJobs(data.jobs);
                setLoadingRunningJobs(false);
            })
            .catch(function (error) {
                console.log(error);
            });
    };

    return {
        runningJobs,
        loadingRunningJobs,
        loadRunningJobs,
    };
}
