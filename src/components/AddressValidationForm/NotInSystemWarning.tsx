import React from "react";

export const NotInSystemWarning: React.FC<{
    onConfirm: () => void;
    onEdit: () => void;
  }> = ({ onConfirm, onEdit }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Address Not Found</h2>
        <p className="mb-6">
          The address you entered couldn't be found in our system. It may not exist or may contain errors.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Edit Address
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Save Anyway
          </button>
        </div>
      </div>
    </div>
  );