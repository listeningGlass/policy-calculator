import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FinancialCalendar from './FinancialCalendar';

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const InputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <input
      type="number"
      inputMode="decimal"
      name={name}
      value={value}
      onChange={onChange}
      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full touch-manipulation"
    />
  </div>
);

const RadioInputField = ({ label, name, value, onChange, isSelected, onRadioChange }) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex items-center gap-2">
      <input
        type="radio"
        name="premiumType"
        checked={isSelected}
        onChange={() => onRadioChange(name)}
        className="h-4 w-4 text-blue-600"
      />
      <label className="text-sm font-medium text-gray-700">{label}</label>
    </div>
    <input
      type="number"
      inputMode="decimal"
      name={name}
      value={value}
      onChange={onChange}
      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full touch-manipulation"
    />
  </div>
);

const TableContainer = ({ title, children }) => (
  <div className="mt-6">
    <h3 className="text-xl font-semibold mb-4">{title}</h3>
    <div className="overflow-x-auto -mx-6 touch-pan-x">
      <div className="inline-block min-w-full align-middle px-6">
        {children}
      </div>
    </div>
  </div>
);

const PolicyCalculator = () => {
  const [inputs, setInputs] = useState({
    annualPremium: "45000",
    maxNonMecPremium: "50232",
    monthlyBills: "3000",
    policyRate: "6.2",
    loanRate: "0.0",
    cashbackRate: "2.0",
    policyLength: "30",
    selectedPremiumType: "annualPremium"
  });

  const [results, setResults] = useState({
    monthlyData: [],
    yearlyData: [],
    selfSustainingYear: null,
    hasCalculated: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePremiumTypeChange = (premiumType) => {
    setInputs(prev => ({
      ...prev,
      selectedPremiumType: premiumType
    }));
  };

  const downloadCsv = (data) => {
    const headers = ["Year", "Income", "Growth", "Bills", "Interest", 
      "Loan Balance", "Cashback", "Cash Value", "Net Equity"];
    
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        row.year,
        row.income,
        row.policyGrowth,
        row.bills,
        row.loanInterest,
        row.loanBalance,
        row.cashback,
        row.cashValue,
        row.netEquity
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'annual_projection.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const calculateResults = () => {
    const numericInputs = {
      monthlyIncome: parseFloat(inputs[inputs.selectedPremiumType]) / 12,
      monthlyBills: parseFloat(inputs.monthlyBills),
      policyRate: parseFloat(inputs.policyRate),
      loanRate: parseFloat(inputs.loanRate),
      cashbackRate: parseFloat(inputs.cashbackRate),
      policyLength: parseInt(inputs.policyLength)
    };

    const yearlyData = [];
    let cashValue = 0;
    let loanBalance = 0;
    let foundSustainableYear = null;
    const annualIncome = numericInputs.monthlyIncome * 12;
    const annualBills = numericInputs.monthlyBills * 12;
    const annualCashback = (numericInputs.monthlyBills * 12 * numericInputs.cashbackRate) / 100;

    for (let year = 1; year <= numericInputs.policyLength; year++) {
      const policyGrowth = cashValue * (numericInputs.policyRate / 100);
      const loanInterest = loanBalance * (numericInputs.loanRate / 100);
      const totalAnnualCosts = loanInterest + annualBills;
      const isNowSelfSustaining = policyGrowth >= totalAnnualCosts;

      if (isNowSelfSustaining && !foundSustainableYear) {
        foundSustainableYear = year;
      }

      if (!foundSustainableYear) {
        cashValue += annualIncome;
      }

      cashValue += policyGrowth;
      loanBalance += annualBills + loanInterest;

      yearlyData.push({
        year,
        income: foundSustainableYear && year > foundSustainableYear ? 0 : annualIncome,
        policyGrowth: Math.round(policyGrowth),
        bills: annualBills,
        loanInterest: Math.round(loanInterest),
        loanBalance: Math.round(loanBalance),
        cashback: Math.round(annualCashback),
        cashValue: Math.round(cashValue),
        netEquity: Math.round(cashValue - loanBalance)
      });
    }

    const monthlyData = [];
    let monthlyCashValue = 0;
    let monthlyLoanBalance = 0;
    const monthlyPolicyGrowth = Math.pow(1 + numericInputs.policyRate/100, 1/12) - 1;
    const monthlyLoanGrowth = Math.pow(1 + numericInputs.loanRate/100, 1/12) - 1;

    for (let month = 1; month <= 12; month++) {
      monthlyCashValue += numericInputs.monthlyIncome;
      const policyGrowth = monthlyCashValue * monthlyPolicyGrowth;
      monthlyCashValue += policyGrowth;
      
      const loanInterest = monthlyLoanBalance * monthlyLoanGrowth;
      monthlyLoanBalance += numericInputs.monthlyBills + loanInterest;
      
      const cashback = (numericInputs.monthlyBills * numericInputs.cashbackRate) / 100;

      monthlyData.push({
        month,
        income: numericInputs.monthlyIncome,
        policyGrowth: Math.round(policyGrowth),
        bills: numericInputs.monthlyBills,
        loanInterest: Math.round(loanInterest),
        loanBalance: Math.round(monthlyLoanBalance),
        cashback: Math.round(cashback),
        cashValue: Math.round(monthlyCashValue),
        netEquity: Math.round(monthlyCashValue - monthlyLoanBalance)
      });
    }

    setResults({
      monthlyData,
      yearlyData,
      selfSustainingYear: foundSustainableYear,
      hasCalculated: true
    });
    downloadCsv(yearlyData);
  };

  return (
    <div className="max-w-full overflow-hidden">
      <Card className="p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6">Your Own Bank</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <RadioInputField
            label="Annual Premium ($)"
            name="annualPremium"
            value={inputs.annualPremium}
            onChange={handleInputChange}
            isSelected={inputs.selectedPremiumType === "annualPremium"}
            onRadioChange={handlePremiumTypeChange}
          />
          <RadioInputField
            label="Max Non-MEC Premium ($)"
            name="maxNonMecPremium"
            value={inputs.maxNonMecPremium}
            onChange={handleInputChange}
            isSelected={inputs.selectedPremiumType === "maxNonMecPremium"}
            onRadioChange={handlePremiumTypeChange}
          />
          <InputField
            label="Monthly Bills ($)"
            name="monthlyBills"
            value={inputs.monthlyBills}
            onChange={handleInputChange}
          />
          <InputField
            label="Policy Growth Rate (%)"
            name="policyRate"
            value={inputs.policyRate}
            onChange={handleInputChange}
          />
          <InputField
            label="Loan Rate (%)"
            name="loanRate"
            value={inputs.loanRate}
            onChange={handleInputChange}
          />
          <InputField
            label="Cashback Rate (%)"
            name="cashbackRate"
            value={inputs.cashbackRate}
            onChange={handleInputChange}
          />
          <InputField
            label="Length of Policy (Years)"
            name="policyLength"
            value={inputs.policyLength}
            onChange={handleInputChange}
          />
        </div>

        <button
          onClick={calculateResults}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 touch-manipulation text-lg font-semibold mb-6"
        >
          Calculate Results
        </button>

        {results.hasCalculated && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg text-sm md:text-base space-y-2">
              <p className="font-semibold text-blue-900">Key Points:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Contributing ${(parseFloat(inputs[inputs.selectedPremiumType])).toLocaleString()} annually to the policy earning {inputs.policyRate}%</li>
                <li>• Monthly bills of ${parseFloat(inputs.monthlyBills).toLocaleString()} are funded through a general account loan at {inputs.loanRate}%</li>
                <li>• Rate arbitrage: {(parseFloat(inputs.policyRate) - parseFloat(inputs.loanRate)).toFixed(1)}% spread, plus {inputs.cashbackRate}% cashback benefits</li>
                <li>
                  {results.selfSustainingYear ? 
                    `• Policy becomes truly self-sustaining in Year ${results.selfSustainingYear} (premium payments can stop)` :
                    '• Policy does not become self-sustaining within the projected timeframe'
                  }
                </li>
              </ul>
            </div>

            <TableContainer title="First Year Monthly Details">
              <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-gray-100 px-3 py-2 text-left z-10">Month</th>
                    <th className="px-3 py-2 text-right">Income</th>
                    <th className="px-3 py-2 text-right">Growth</th>
                    <th className="px-3 py-2 text-right">Bills</th>
                    <th className="px-3 py-2 text-right">Interest</th>
                    <th className="px-3 py-2 text-right">Loan Bal.</th>
                    <th className="px-3 py-2 text-right">Cashback</th>
                    <th className="px-3 py-2 text-right">Cash Val.</th>
                    <th className="px-3 py-2 text-right">Net Eq.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.monthlyData.map((data) => (
                    <tr key={data.month}>
                      <td className="sticky left-0 bg-white px-3 py-2 font-medium z-10">{data.month}</td>
                      <td className="px-3 py-2 text-right">${data.income.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.policyGrowth.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.bills.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.loanInterest.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.loanBalance.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.cashback.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.cashValue.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.netEquity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>

            <FinancialCalendar 
              monthlyBills={parseFloat(inputs.monthlyBills)}
              premium={parseFloat(inputs[inputs.selectedPremiumType]) / 12}
              cashbackRate={parseFloat(inputs.cashbackRate)}
            />

            <TableContainer title="Annual Growth Visualization">
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={results.yearlyData}
                    margin={{ top: 20, right: 20, left: 80, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                    <XAxis 
                      dataKey="year" 
                      tickLine={false}
                      axisLine={true}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${(value/1000).toLocaleString()}k`}
                      axisLine={true}
                      tickLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px' }}
                      formatter={(value, name) => [`$${value.toLocaleString()}`, name]}
                      labelFormatter={(label) => `Year ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      name="Annual Premium" 
                      stroke="#9333ea" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bills" 
                      name="Annual Bills" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cashValue" 
                      name="Cash Value" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={true}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="loanBalance" 
                      name="Loan Balance" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="netEquity" 
                      name="Net Equity" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TableContainer>

            <TableContainer title="Annual Projection">
              <table className="min-w-full divide-y divide-gray-200 whitespace-nowrap text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-gray-100 px-3 py-2 text-left z-10">Year</th>
                    <th className="px-3 py-2 text-right">Income</th>
                    <th className="px-3 py-2 text-right">Growth</th>
                    <th className="px-3 py-2 text-right">Bills</th>
                    <th className="px-3 py-2 text-right">Interest</th>
                    <th className="px-3 py-2 text-right">Loan Bal.</th>
                    <th className="px-3 py-2 text-right">Cashback</th>
                    <th className="px-3 py-2 text-right">Cash Val.</th>
                    <th className="px-3 py-2 text-right">Net Eq.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.yearlyData.map((data) => (
                    <tr key={data.year} className={data.year === results.selfSustainingYear ? 'bg-green-50' : ''}>
                      <td className="sticky left-0 bg-white px-3 py-2 font-medium z-10">{data.year}</td>
                      <td className="px-3 py-2 text-right">${data.income.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.policyGrowth.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.bills.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.loanInterest.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.loanBalance.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.cashback.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.cashValue.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">${data.netEquity.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableContainer>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PolicyCalculator;