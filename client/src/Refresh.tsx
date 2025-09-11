
export async function fetchWithRefresh(url: string, options: RequestInit = {}, navigate: any ) {
    let response = await fetch(url, options);
    if (response.status === 401) {
      const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        response = await fetch(url, options);
      } else {
        navigate("/");
      }
    }
    return response;
};
  