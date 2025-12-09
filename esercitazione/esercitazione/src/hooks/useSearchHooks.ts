import React, { useState, useEffect } from 'react';

function useSearchHooks(query: string) {
    const BASE_URL = 'https://api.tvmaze.com/search/shows?q=' + query;
    const [result, setResult] = useState('')
    const [loading, setLoading] = useState(true);
    const [error,setError]=useState('')
    useEffect(() => {
            setLoading(true);
            fetch(BASE_URL)
                .then(res => res.json())
                .then(data => {
                    setResult(JSON.stringify(data));
                    console.log(data)
                })
            setLoading(false);
    }, [query])
    return { result, loading }
}
export default useSearchHooks;