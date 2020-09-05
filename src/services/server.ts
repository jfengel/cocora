export const saveRating = (place: string, rating: number) : Promise<any> => {
    return new Promise(async (success, failure) => {
        try {
            const response = await fetch(`/.netlify/functions/rating/${place}?value=${rating}`)
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

