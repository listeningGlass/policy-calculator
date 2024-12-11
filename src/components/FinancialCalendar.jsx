const FinancialCalendar = ({ monthlyBills = 3000, premium = 3750, cashbackRate = 2.0 }) => {
    const months = [
      ['January', 'February', 'March', 'April'],
      ['May', 'June', 'July', 'August'],
      ['September', 'October', 'November', 'December']
    ];
  
    const CalendarEvent = ({ type }) => {
      const styles = {
        premium: 'bg-blue-100 text-blue-800 text-xs p-1 rounded',
        credit: 'bg-green-100 text-green-800 text-xs p-1 rounded',
        borrow: 'bg-orange-100 text-orange-800 text-xs p-1 rounded'
      };
  
      const labels = {
        premium: `Premium Payment: $${premium.toLocaleString()}`,
        credit: `Pay Bills with your credit card (${cashbackRate}% back)`,
        borrow: `Borrow: $${(monthlyBills * 1).toLocaleString()}`
      };
  
      return (
        <div className={styles[type]}>
          {labels[type]}
        </div>
      );
    };
  
    return (
      <div className="w-full p-4 bg-white rounded-lg border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Monthly Payment Schedule</h3>
        <div className="space-y-4">
          {months.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-4">
              {row.map((month) => (
                <div key={month} className="border rounded p-4 bg-gray-50">
                  <h3 className="font-bold mb-2">{month}</h3>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-600">Day 1:</div>
                    <CalendarEvent type="premium" />
                    
                    <div className="text-xs text-gray-600">Days 1-28:</div>
                    <CalendarEvent type="credit" />
                    
                    <div className="text-xs text-gray-600">Day 2:</div>
                    <CalendarEvent type="borrow" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default FinancialCalendar;