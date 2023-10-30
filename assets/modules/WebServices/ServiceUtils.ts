const getRequestInfo = (url: string): Record<string, string> => {
    const _url = new URL(url);
    const params = Object.fromEntries(_url.searchParams);
    return { ...params, base_url: `${_url.origin}${_url.pathname}` };
};

export default getRequestInfo;
