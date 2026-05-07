import React, { useEffect, useCallback } from 'react';
import QuestionTable from './QuestionComponent/QuestionTable';

const ManageQuestion: React.FC = () => {


  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4 border-b-4 border-blue-600 pb-2">
          Manage Questions
        </h2>
        {/* <button onClick={loadMore}>LOAD MORE</button> */}
        <QuestionTable />
      </div>
    </div>
  );
};

export default ManageQuestion;
