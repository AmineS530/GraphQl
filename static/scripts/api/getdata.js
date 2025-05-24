import { APIS } from "../helpers/vars.js";

export async function fetchData(req, authToken) {
    if (!req || !authToken) {
        console.error("Request or authToken is missing.");
        return null;
    }
    try {
        const response = await fetch(APIS.GET_DATA, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken.slice(1, -1)}`,
            },
            body: JSON.stringify(req),
        });

        if (!response.ok) throw new Error("Failed to fetch data.");

        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return null;
    }
}
