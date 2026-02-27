export const mexicoTime = () => {
    const now = new Date();
    now.setHours(now.getHours() - 6);
    return now;
};