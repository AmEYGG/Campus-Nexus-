import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Receipt,
  DollarSign,
  FileCheck,
  Image as ImageIcon,
  ExternalLink,
  Filter,
  Download
} from 'lucide-react';

const BudgetTransparency = () => {
  const [budgets, setBudgets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories for budget filtering
  const categories = [
    { id: 'all', label: 'All Budgets' },
    { id: 'events', label: 'Event Funds' },
    { id: 'departments', label: 'Department Budgets' },
    { id: 'mess', label: 'Mess Budgets' }
  ];

  const BudgetCard = ({ budget }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-sm p-6 mb-4"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{budget.title}</h3>
            <p className="text-sm text-gray-500">{budget.category}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">₹{budget.amount.toLocaleString()}</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Show Less' : 'Show Details'}
            </button>
          </div>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="mt-4 border-t pt-4"
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Description</h4>
                <p className="text-gray-600">{budget.description}</p>
              </div>

              {/* Expense Proofs Section */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Expense Proofs</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budget.expenseProofs.map((proof, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      {proof.type === 'receipt' ? (
                        <Receipt className="w-5 h-5 text-gray-500 mr-2" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-500 mr-2" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{proof.title}</p>
                        <p className="text-xs text-gray-500">{proof.date}</p>
                      </div>
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center">
                <FileCheck className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Verified by {budget.verifiedBy} on {budget.verificationDate}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Budget Transparency Portal</h1>
        <p className="mt-1 text-gray-600">
          View all college sponsorships, budgets, and expense verifications
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search budgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Filter className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Export Button */}
      <div className="mb-6">
        <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export Budget Report
        </button>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget) => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
      </div>
    </div>
  );
};

export default BudgetTransparency; 