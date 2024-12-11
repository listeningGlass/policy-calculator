import { useState } from 'react';
import _ from 'lodash';

// Component declarations first
const Card = ({ children, className = '' }) => (
 <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
   {children}
 </div>
);

const CardHeader = ({ children }) => (
 <div className="px-6 py-4 border-b border-gray-200">
   {children}
 </div>
);

const CardTitle = ({ children }) => (
 <h2 className="text-2xl font-bold text-gray-900">
   {children}
 </h2>
);

const CardContent = ({ children }) => (
 <div className="p-6">
   {children}
 </div>
);

// Main component follows
const PolicyTableInput = () => {
 const [inputText, setInputText] = useState('');
 const [data, setData] = useState([]);
 const [showTable, setShowTable] = useState(false);
 const [error, setError] = useState(null);
 const [sustainableYear, setSustainableYear] = useState(null);

 const formatCurrency = (value) => {
   return new Intl.NumberFormat('en-US', {
     style: 'currency',
     currency: 'USD',
     minimumFractionDigits: 2,
     maximumFractionDigits: 2
   }).format(value);
 };

 const findSustainableYear = (policyData) => {
   for (let i = 0; i < policyData.length - 1; i++) {
     const currentYear = policyData[i];
     const nextYear = policyData[i + 1];
     
     // Check if the accumulated value plus next year's credits can cover next year's charges
     const nextYearSustainable = currentYear.accumulatedValue + nextYear.totalCredits >= nextYear.policyCharges;
     
     if (nextYearSustainable) {
       return currentYear.policyYear;
     }
   }
   return null;
 };

 const downloadCSV = (data) => {
  const headers = [
    "Year", "Age", "Premium Outlay", "Premium Expense", "Cost of Insurance", 
    "Other Benefits", "Policy Fee", "Expense Charge", "Accumulated Value Charge",
    "Policy Charges", "Interest Credit", "Additional Bonus", "Total Credits",
    "Accumulated Value", "Surrender Charge", "Cash Surrender Value", "Net Death Benefit"
  ];

  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.policyYear,
      row.age,
      row.premiumOutlay,
      row.premiumExpenseCharge,
      row.costOfInsurance,
      row.costOfOtherBenefits,
      row.policyFee,
      row.expenseCharge,
      row.accumulatedValueCharge,
      row.policyCharges,
      row.interestCredit,
      row.additionalBonus,
      row.totalCredits,
      row.accumulatedValue,
      row.surrenderCharge,
      row.cashSurrenderValue,
      row.netDeathBenefit
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', 'policy_details.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

 const parsePolicyData = () => {
   try {
     const rows = inputText.match(/^\d+\s+\d+.*$/gm);
     
     if (!rows || rows.length === 0) {
       setError('No valid data rows found. Please check the input format.');
       setShowTable(false);
       return;
     }

     const processedData = rows.map(row => {
       const values = row.trim().split(/\s+/);
       
       const parseCurrency = (str) => {
         return parseFloat(str.replace(/[$,]/g, '')) || 0;
       };

       return {
         policyYear: parseInt(values[0]) || 0,
         age: parseInt(values[1]) || 0,
         premiumOutlay: parseCurrency(values[2]),
         premiumExpenseCharge: parseCurrency(values[3]),
         costOfInsurance: parseCurrency(values[4]),
         costOfOtherBenefits: parseCurrency(values[5]),
         policyFee: parseCurrency(values[6]),
         expenseCharge: parseCurrency(values[7]),
         accumulatedValueCharge: parseCurrency(values[8]),
         policyCharges: parseCurrency(values[9]),
         interestCredit: parseCurrency(values[10]),
         additionalBonus: parseCurrency(values[11]),
         totalCredits: parseCurrency(values[12]),
         accumulatedValue: parseCurrency(values[13]),
         surrenderCharge: parseCurrency(values[14]),
         cashSurrenderValue: parseCurrency(values[15]),
         netDeathBenefit: parseCurrency(values[16])
       };
     });

     const sustainableYr = findSustainableYear(processedData);
     setSustainableYear(sustainableYr);
     setData(processedData);
     setShowTable(true);
     setError(null);
     downloadCSV(processedData);
   } catch (err) {
     setError('Error parsing data: ' + err.message);
     setShowTable(false);
   }
 };

 return (
   <div className="space-y-6 p-4">
     <Card>
       <CardHeader>
         <CardTitle>Input Policy Data</CardTitle>
       </CardHeader>
       <CardContent>
         <div className="space-y-4">
           <textarea
             className="w-full h-64 p-2 border rounded-md font-mono text-sm"
             placeholder="Paste policy data here..."
             value={inputText}
             onChange={(e) => setInputText(e.target.value)}
           />
           <button
             className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
             onClick={parsePolicyData}
           >
             Create Table
           </button>
           {error && (
             <div className="text-red-500 mt-2">{error}</div>
           )}
         </div>
       </CardContent>
     </Card>

     {showTable && (
       <>
         <Card>
           <CardHeader>
             <CardTitle>Policy Details</CardTitle>

           </CardHeader>
           <CardContent>
             <div className="overflow-x-auto">
               <table id="policy-table" className="w-full border-collapse">
                 <thead>
                   <tr>
                     <th className="p-2 border text-left">Year</th>
                     <th className="p-2 border text-left">Age</th>
                     <th className="p-2 border text-right">Premium Outlay</th>
                     <th className="p-2 border text-right">Premium Expense</th>
                     <th className="p-2 border text-right">Cost of Insurance</th>
                     <th className="p-2 border text-right">Other Benefits</th>
                     <th className="p-2 border text-right">Policy Fee</th>
                     <th className="p-2 border text-right">Expense Charge</th>
                     <th className="p-2 border text-right">Accumulated Value Charge</th>
                     <th className="p-2 border text-right">Policy Charges</th>
                     <th className="p-2 border text-right">Interest Credit</th>
                     <th className="p-2 border text-right">Additional Bonus</th>
                     <th className="p-2 border text-right">Total Credits</th>
                     <th className="p-2 border text-right">Accumulated Value</th>
                     <th className="p-2 border text-right">Surrender Charge</th>
                     <th className="p-2 border text-right">Cash Surrender Value</th>
                     <th className="p-2 border text-right">Net Death Benefit</th>
                   </tr>
                 </thead>
                 <tbody>
                   {data.map((row) => (
                     <tr 
                       key={row.policyYear} 
                     >
                       <td className="p-2 border">{row.policyYear}</td>
                       <td className="p-2 border">{row.age}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.premiumOutlay)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.premiumExpenseCharge)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.costOfInsurance)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.costOfOtherBenefits)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.policyFee)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.expenseCharge)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.accumulatedValueCharge)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.policyCharges)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.interestCredit)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.additionalBonus)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.totalCredits)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.accumulatedValue)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.surrenderCharge)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.cashSurrenderValue)}</td>
                       <td className="p-2 border text-right">{formatCurrency(row.netDeathBenefit)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </CardContent>
         </Card>

         <Card>
           <CardHeader>
             <CardTitle>Summary Statistics</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               <div>
                 <h3 className="font-semibold">Total Premium Outlay</h3>
                 <p className="text-lg">{formatCurrency(_.sumBy(data, 'premiumOutlay'))}</p>
               </div>
               <div>
                 <h3 className="font-semibold">Total Policy Charges</h3>
                 <p className="text-lg">{formatCurrency(_.sumBy(data, 'policyCharges'))}</p>
               </div>
               <div>
                 <h3 className="font-semibold">Total Credits</h3>
                 <p className="text-lg">{formatCurrency(_.sumBy(data, 'totalCredits'))}</p>
               </div>
               <div>
                 <h3 className="font-semibold">Final Accumulated Value</h3>
                 <p className="text-lg">{formatCurrency(_.last(data)?.accumulatedValue || 0)}</p>
               </div>
               <div>
                 <h3 className="font-semibold">Final Death Benefit</h3>
                 <p className="text-lg">{formatCurrency(_.last(data)?.netDeathBenefit || 0)}</p>
               </div>
             </div>
           </CardContent>
         </Card>
       </>
     )}
   </div>
 );
};

export default PolicyTableInput;