export const getCurrentTimeInMinutes = (): number => {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return hours * 60 + minutes;
}