import {Auth0ContextInterface} from "@auth0/auth0-react";

export const saveRating = (place: string, rating: number, auth0: Auth0ContextInterface) : Promise<any> => {
    return new Promise(async (success, failure) => {
        try {
            const response = await fetch(`/.netlify/functions/rating/${place}?value=${rating}`, {
                headers: {
                    "Content-Type": 'application/json',
                    "Authorization": 'Bearer ' + (await auth0.getIdTokenClaims()).__raw,
                },
            })
            if(response.ok) {
                success(await response.json());
            } else {
                failure(response);
            }
        } catch(e) {
            failure(e);
        }
    })
}

export const getAverageRating = (place: string) : Promise<any> => {
    return new Promise(async (success, failure) => {
        try {
            const response = await fetch(`/.netlify/functions/averageRating/${place}`)
            if(response.ok) {
                success(await response.json());
            } else {
                failure(response);
            }
        } catch(e) {
            failure(e);
        }
    })
}

