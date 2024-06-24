'use client';

import React from 'react';
import { AddressValidationForm, AddressResult } from '../../components/AddressValidationForm';



const AddressValidationPage: React.FC = () => {
  const handleAddressSave = (result: AddressResult) => {
    console.log('Address saved:', result);
    // Here you would typically save the address to your backend or state management
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Address Validation</h1>
      <AddressValidationForm onAddressSave={handleAddressSave} />
    </div>
  );
};

export default AddressValidationPage;