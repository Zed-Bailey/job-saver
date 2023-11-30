
/**
 * API URL
 */
export const ApiUrl: string = process.env.NODE_ENV == "development" ? "http://localhost:3000/api" : "https://job-saver-api.vercel.app/api";