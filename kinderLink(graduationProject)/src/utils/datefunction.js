function getWeekStart(date) {
    const current = new Date(date); 
    const day = current.getDay();
    const diff = (day < 6) ? - (day + 1) : 0;
    current.setDate(current.getDate() + diff);
    
    return current;
  }
  export default getWeekStart;