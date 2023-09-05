function getCurrentDate() {
    const currentDate = new Date();
  
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}
function getOneWeekAgoDate(){
    const oneWeekAgo = new Date();
  
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
    const year = oneWeekAgo.getFullYear();
    const month = String(oneWeekAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneWeekAgo.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}

module.exports = {
    getCurrentDate,
    getOneWeekAgoDate
};