export default (createdAt: Date | string | number): number => {
    // Ensure `createdAt` is a Date object
    const orderDate = new Date(createdAt);
    const currentDate = new Date();
    
    // Calculate the time difference in milliseconds
    const timeDifference = currentDate.getTime() - orderDate.getTime();
    
    // Convert milliseconds to days and return
    return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  };